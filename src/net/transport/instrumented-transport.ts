import type {
  IWebSocketTransport,
  ReadyState,
  CloseEventLike,
} from '@/net/transport/browser-websocket';

/**
 * InstrumentedTransport wraps any IWebSocketTransport and exposes two extra hooks:
 * - onConnecting: fired when connect() is invoked
 * - onOutgoing: fired when send() is invoked with the outgoing text payload
 *
 * All other events are proxied from the inner transport.
 */
export class InstrumentedTransport implements IWebSocketTransport {
  private readonly inner: IWebSocketTransport;
  private readonly connectingHandlers = new Set<() => void>();
  private readonly outgoingHandlers = new Set<(data: string) => void>();

  constructor(inner: IWebSocketTransport) {
    this.inner = inner;
  }

  get readyState(): ReadyState {
    return this.inner.readyState;
  }

  connect(): void {
    // Notify observers first, then delegate
    for (const h of this.connectingHandlers) h();
    this.inner.connect();
  }

  disconnect(code?: number, reason?: string): void {
    this.inner.disconnect(code, reason);
  }

  send(data: string): void {
    // Emit before sending so observers can record timing/bytes
    for (const h of this.outgoingHandlers) h(data);
    this.inner.send(data);
  }

  onOpen(cb: () => void): () => void {
    return this.inner.onOpen(cb);
  }

  onClose(cb: (ev: CloseEventLike) => void): () => void {
    return this.inner.onClose(cb);
  }

  onError(cb: (err: unknown) => void): () => void {
    return this.inner.onError(cb);
  }

  onMessage(cb: (data: string) => void): () => void {
    return this.inner.onMessage(cb);
  }

  /**
   * Subscribe to the moment connect() is called.
   */
  onConnecting(cb: () => void): () => void {
    this.connectingHandlers.add(cb);
    return () => this.connectingHandlers.delete(cb);
  }

  /**
   * Subscribe to outgoing text payloads.
   */
  onOutgoing(cb: (data: string) => void): () => void {
    this.outgoingHandlers.add(cb);
    return () => this.outgoingHandlers.delete(cb);
  }
}
