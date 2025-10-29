import type { SignalUnion } from "@/net/protocol/schema";

export type RequestMatcher = (signal: SignalUnion) => boolean;

export type RequestOptions = {
  timeoutMs?: number;
  requestId?: string;
};

type Pending = {
  matcher: RequestMatcher;
  resolve: (signal: SignalUnion) => void;
  reject: (err: unknown) => void;
  timer: number | null;
  requestId?: string;
};

export class RequestTracker {
  private readonly pendings: Set<Pending> = new Set();
  private readonly defaultTimeoutMs: number;

  constructor(defaultTimeoutMs: number = 10_000) {
    this.defaultTimeoutMs = defaultTimeoutMs;
  }

  waitFor(
    matcher: RequestMatcher,
    options: RequestOptions = {}
  ): Promise<SignalUnion> {
    const timeoutMs = options.timeoutMs ?? this.defaultTimeoutMs;
    return new Promise<SignalUnion>((resolve, reject) => {
      const pending: Pending = {
        matcher,
        resolve,
        reject,
        timer: null,
        requestId: options.requestId,
      };
      if (timeoutMs > 0) {
        pending.timer = setTimeout(() => {
          this.pendings.delete(pending);
          reject(new Error("Request timed out"));
        }, timeoutMs) as unknown as number;
      }
      this.pendings.add(pending);
    });
  }

  handleSignal(signal: SignalUnion): boolean {
    for (const pending of Array.from(this.pendings)) {
      // If both have requestId, enforce equality to reduce cross-matches
      if (
        pending.requestId &&
        signal.request_id &&
        pending.requestId !== signal.request_id
      ) {
        continue;
      }
      if (pending.matcher(signal)) {
        this.pendings.delete(pending);
        if (pending.timer !== null) clearTimeout(pending.timer);
        pending.resolve(signal);
        return true;
      }
    }
    return false;
  }

  cancelAll(reason: string = "Cancelled"): void {
    for (const pending of Array.from(this.pendings)) {
      this.pendings.delete(pending);
      if (pending.timer !== null) clearTimeout(pending.timer);
      pending.reject(new Error(reason));
    }
  }
}
