import type { IWebSocketTransport } from '@/net/transport/browser-websocket';
import { RequestTracker } from '@/net/request-tracker';
import {
  encodeAction,
  decodeSignal,
  type ActionName,
  type ActionParams,
  type SignalEnvelopeOf,
  type SignalName,
  type SignalUnion,
  type SignalData,
  type ActionEnvelopeOf,
} from '@/net/protocol/schema';
import {
  ActionToSignal,
  getDefaultMatcher,
  type ExpectedSignalByAction,
} from '@/net/protocol/mapping';

export type SendOptions<A extends ActionName> = {
  timeoutMs?: number;
  matcher?: (signal: SignalUnion) => boolean;
  requestId?: string;
};

export class WebSocketClient {
  private readonly transport: IWebSocketTransport;
  private readonly tracker: RequestTracker;
  private readonly perSignalHandlers: Map<
    SignalName,
    Set<(data: unknown) => void>
  > = new Map();
  private readonly anyHandlers: Set<(envelope: SignalUnion) => void> =
    new Set();
  private unsubscribers: Array<() => void> = [];

  constructor(
    transport: IWebSocketTransport,
    defaultTimeoutMs: number = 10_000,
  ) {
    this.transport = transport;
    this.tracker = new RequestTracker(defaultTimeoutMs);
  }

  connect(): void {
    if (this.unsubscribers.length === 0) {
      this.unsubscribers.push(
        this.transport.onMessage((txt) => this.handleRawMessage(txt)),
        this.transport.onError(() => {
          // Do nothing; errors surface via close or remain transient
        }),
        this.transport.onClose(() => {
          // Reject all in-flight requests when connection closes; callers can retry
          this.tracker.cancelAll('Connection closed');
        }),
      );
    }
    this.transport.connect();
  }

  disconnect(code?: number, reason?: string): void {
    this.tracker.cancelAll('Disconnected');
    this.transport.disconnect(code, reason);
  }

  on<S extends SignalName>(
    signal: S,
    handler: (data: SignalData[S]) => void,
  ): () => void {
    let set = this.perSignalHandlers.get(signal);
    if (!set) {
      set = new Set();
      this.perSignalHandlers.set(signal, set);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (set as Set<(data: any) => void>).add(handler as (data: any) => void);
    return () => this.off(signal, handler);
  }

  off<S extends SignalName>(
    signal: S,
    handler: (data: SignalData[S]) => void,
  ): void {
    const set = this.perSignalHandlers.get(signal);
    if (!set) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (set as Set<(data: any) => void>).delete(handler as (data: any) => void);
    if (set.size === 0) this.perSignalHandlers.delete(signal);
  }

  onAny(handler: (envelope: SignalUnion) => void): () => void {
    this.anyHandlers.add(handler);
    return () => {
      this.anyHandlers.delete(handler);
    };
  }

  async sendAction<A extends ActionName>(
    action: A,
    params: ActionParams[A],
    options: SendOptions<A> = {},
  ): Promise<
    SignalEnvelopeOf<ExpectedSignalByAction[A]> | SignalEnvelopeOf<'error'>
  > {
    const requestId = options.requestId ?? generateRequestId();
    const envelope: ActionEnvelopeOf<A> = encodeAction(
      action,
      params,
      requestId,
    );

    const defaultMatcher = getDefaultMatcher(envelope);
    const matcher = options.matcher
      ? options.matcher
      : (sig: SignalUnion) =>
          defaultMatcher(sig) ||
          (envelope.request_id !== undefined &&
            sig.signal === 'error' &&
            sig.request_id === envelope.request_id);

    const waiting = this.tracker.waitFor(matcher, {
      timeoutMs: options.timeoutMs,
      requestId,
    });

    this.transport.send(JSON.stringify(envelope));
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return (await waiting) as
      | SignalEnvelopeOf<ExpectedSignalByAction[A]>
      | SignalEnvelopeOf<'error'>;
  }

  waitFor<S extends SignalName>(
    predicate: (env: SignalEnvelopeOf<S>) => boolean,
    options: { timeoutMs?: number } = {},
  ): Promise<SignalEnvelopeOf<S>> {
    return new Promise<SignalEnvelopeOf<S>>((resolve, reject) => {
      const wrapped = (env: SignalUnion): boolean => {
        try {
          return predicate(env as SignalEnvelopeOf<S>);
        } catch {
          return false;
        }
      };
      this.tracker
        .waitFor((sig) => wrapped(sig), { timeoutMs: options.timeoutMs })
        .then((sig) => resolve(sig as SignalEnvelopeOf<S>))
        .catch(reject);
    });
  }

  private handleRawMessage(txt: string): void {
    let parsed: unknown;
    try {
      parsed = JSON.parse(txt);
    } catch {
      return; // ignore invalid JSON
    }
    let signal: SignalUnion;
    try {
      signal = decodeSignal(parsed);
    } catch {
      return; // ignore invalid signal shape
    }
    // First satisfy any awaiting request
    if (!this.tracker.handleSignal(signal)) {
      // Broadcast to subscribers
      for (const h of this.anyHandlers) h(signal);
      const set = this.perSignalHandlers.get(signal.signal as SignalName);
      if (set) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const fn of set as Set<(data: any) => void>) fn(signal.data);
      }
    }
  }
}

function generateRequestId(): string {
  try {
    if (
      typeof crypto !== 'undefined' &&
      typeof crypto.randomUUID === 'function'
    ) {
      return crypto.randomUUID();
    }
  } catch {
    // ignore
  }
  return `req_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}
