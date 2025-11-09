import { EventBus } from '@/net/events';
import type { WebSocketClient } from '@/net/client';
import type { SignalUnion } from '@/net/protocol/schema';
import type { InstrumentedTransport } from '@/net/transport/instrumented-transport';

export type NetTelemetryEvent =
  | {
      dir: 'conn';
      kind: 'connecting' | 'open' | 'close' | 'error';
      t: number;
      info?: unknown;
    }
  | {
      dir: 'out';
      kind: 'outgoing';
      t: number;
      text: string;
      bytes: number;
      action?: string;
      request_id?: string;
    }
  | {
      dir: 'in';
      kind: 'incoming-raw';
      t: number;
      text: string;
      bytes: number;
    }
  | {
      dir: 'in';
      kind: 'incoming-signal';
      t: number;
      signal: SignalUnion;
    };

type NetTelemetryBus = {
  event: NetTelemetryEvent;
};

export const netTelemetry = new EventBus<NetTelemetryBus>();

function safeJsonParse(text: string): unknown | undefined {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export function wireNetTelemetry(
  client: WebSocketClient,
  transport: InstrumentedTransport,
): () => void {
  const unsubs: Array<() => void> = [];

  // Connection lifecycle
  unsubs.push(
    transport.onConnecting(() =>
      netTelemetry.emit('event', {
        dir: 'conn',
        kind: 'connecting',
        t: Date.now(),
      }),
    ),
  );

  unsubs.push(
    transport.onOpen(() =>
      netTelemetry.emit('event', { dir: 'conn', kind: 'open', t: Date.now() }),
    ),
  );

  unsubs.push(
    transport.onClose((ev) =>
      netTelemetry.emit('event', {
        dir: 'conn',
        kind: 'close',
        t: Date.now(),
        info: ev,
      }),
    ),
  );

  unsubs.push(
    transport.onError((err) =>
      netTelemetry.emit('event', {
        dir: 'conn',
        kind: 'error',
        t: Date.now(),
        info: serializeError(err),
      }),
    ),
  );

  // Decoded incoming signals from client
  unsubs.push(
    client.onAny((signal) =>
      netTelemetry.emit('event', {
        dir: 'in',
        kind: 'incoming-signal',
        t: Date.now(),
        signal,
      }),
    ),
  );

  // Outgoing envelopes
  unsubs.push(
    transport.onOutgoing((text) => {
      const parsed = safeJsonParse(text);
      const action =
        typeof parsed === 'object' && parsed && 'action' in parsed
          ? String((parsed as any).action)
          : undefined;
      const request_id =
        typeof parsed === 'object' && parsed && 'request_id' in parsed
          ? String((parsed as any).request_id)
          : undefined;
      netTelemetry.emit('event', {
        dir: 'out',
        kind: 'outgoing',
        t: Date.now(),
        text,
        bytes: byteLength(text),
        action,
        request_id,
      });
    }),
  );

  return () => {
    for (const off of unsubs) off();
  };
}

function byteLength(text: string): number {
  try {
    if (typeof TextEncoder !== 'undefined')
      return new TextEncoder().encode(text).length;
  } catch {}
  // Fallback approximate byte length
  return unescape(encodeURIComponent(text)).length;
}

function serializeError(err: unknown): unknown {
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: err.stack };
  }
  try {
    return JSON.parse(JSON.stringify(err));
  } catch {
    return String(err);
  }
}
