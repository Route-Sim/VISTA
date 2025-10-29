export interface BackoffStrategy {
  reset(): void;
  nextDelayMs(): number;
}

export type ExponentialBackoffOptions = {
  initialDelayMs?: number;
  factor?: number;
  maxDelayMs?: number;
  jitterRatio?: number; // 0..1, fraction of delay used for random jitter
};

export class ExponentialBackoff implements BackoffStrategy {
  private readonly initialDelayMs: number;
  private readonly factor: number;
  private readonly maxDelayMs: number;
  private readonly jitterRatio: number;
  private attempt: number;

  constructor(options: ExponentialBackoffOptions = {}) {
    this.initialDelayMs = options.initialDelayMs ?? 500;
    this.factor = options.factor ?? 2;
    this.maxDelayMs = options.maxDelayMs ?? 30_000;
    this.jitterRatio = clamp01(options.jitterRatio ?? 0.2);
    this.attempt = 0;
  }

  reset(): void {
    this.attempt = 0;
  }

  nextDelayMs(): number {
    const base = Math.min(
      this.initialDelayMs * Math.pow(this.factor, this.attempt++),
      this.maxDelayMs
    );
    if (this.jitterRatio <= 0) return base;
    const jitter = base * this.jitterRatio;
    const min = base - jitter;
    const max = base + jitter;
    return Math.floor(min + Math.random() * (max - min));
  }
}

function clamp01(v: number): number {
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}
