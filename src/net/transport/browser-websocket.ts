import type { BackoffStrategy } from "@/net/backoff";

export type ReadyState = "idle" | "connecting" | "open" | "closing" | "closed";

export type CloseEventLike = {
  code?: number;
  reason?: string;
  wasClean?: boolean;
};

export interface IWebSocketTransport {
  readonly readyState: ReadyState;
  connect(): void;
  disconnect(code?: number, reason?: string): void;
  send(data: string): void;
  onOpen(cb: () => void): () => void;
  onClose(cb: (ev: CloseEventLike) => void): () => void;
  onError(cb: (err: unknown) => void): () => void;
  onMessage(cb: (data: string) => void): () => void;
}

export type BrowserWebSocketTransportOptions = {
  url: string | (() => string);
  backoff: BackoffStrategy;
};

export class BrowserWebSocketTransport implements IWebSocketTransport {
  public readyState: ReadyState = "idle";
  private ws: WebSocket | null = null;
  private readonly url: string | (() => string);
  private readonly backoff: BackoffStrategy;
  private explicitClose = false;
  private reconnectTimer: number | null = null;
  private readonly openHandlers = new Set<() => void>();
  private readonly closeHandlers = new Set<(ev: CloseEventLike) => void>();
  private readonly errorHandlers = new Set<(err: unknown) => void>();
  private readonly messageHandlers = new Set<(data: string) => void>();

  constructor(options: BrowserWebSocketTransportOptions) {
    this.url = options.url;
    this.backoff = options.backoff;
  }

  connect(): void {
    if (this.readyState === "open" || this.readyState === "connecting") return;
    this.explicitClose = false;
    this.openSocket();
  }

  disconnect(code?: number, reason?: string): void {
    this.explicitClose = true;
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (
      this.ws &&
      (this.readyState === "open" || this.readyState === "connecting")
    ) {
      this.readyState = "closing";
      try {
        this.ws.close(code, reason);
      } catch {
        // ignore
      }
    }
  }

  send(data: string): void {
    if (!this.ws || this.readyState !== "open") {
      throw new Error("WebSocket is not open");
    }
    this.ws.send(data);
  }

  onOpen(cb: () => void): () => void {
    this.openHandlers.add(cb);
    return () => this.openHandlers.delete(cb);
  }

  onClose(cb: (ev: CloseEventLike) => void): () => void {
    this.closeHandlers.add(cb);
    return () => this.closeHandlers.delete(cb);
  }

  onError(cb: (err: unknown) => void): () => void {
    this.errorHandlers.add(cb);
    return () => this.errorHandlers.delete(cb);
  }

  onMessage(cb: (data: string) => void): () => void {
    this.messageHandlers.add(cb);
    return () => this.messageHandlers.delete(cb);
  }

  private openSocket(): void {
    this.readyState = "connecting";
    const currentUrl = typeof this.url === "function" ? this.url() : this.url;
    try {
      this.ws = new WebSocket(currentUrl);
    } catch (err) {
      this.handleError(err);
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.readyState = "open";
      this.backoff.reset();
      for (const h of this.openHandlers) h();
    };

    this.ws.onmessage = (ev: MessageEvent) => {
      const data = ev.data as unknown;
      if (typeof data === "string") {
        for (const h of this.messageHandlers) h(data);
        return;
      }
      if (typeof Blob !== "undefined" && data instanceof Blob) {
        data
          .text()
          .then((t) => {
            for (const h of this.messageHandlers) h(t);
          })
          .catch((err) => this.handleError(err));
        return;
      }
      // unsupported payload type; surface as error
      this.handleError(new Error("Unsupported WebSocket message payload type"));
    };

    this.ws.onerror = (ev: Event) => {
      this.handleError(ev);
    };

    this.ws.onclose = (ev: CloseEvent) => {
      this.readyState = "closed";
      this.ws = null;
      for (const h of this.closeHandlers) h(ev);
      if (!this.explicitClose) this.scheduleReconnect();
    };
  }

  private scheduleReconnect(): void {
    if (this.explicitClose) return;
    const delay = this.backoff.nextDelayMs();
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.openSocket();
    }, delay) as unknown as number;
  }

  private handleError(err: unknown): void {
    for (const h of this.errorHandlers) h(err);
  }
}
