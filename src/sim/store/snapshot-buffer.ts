import type { SimSnapshot } from './snapshot';
import { computeAlpha } from './time';

export class SnapshotBuffer {
  private readonly capacity: number;
  private readonly items: SimSnapshot[] = [];

  constructor(capacity: number = 64) {
    if (capacity <= 1) throw new Error('SnapshotBuffer capacity must be > 1');
    this.capacity = capacity;
  }

  clear(): void {
    this.items.length = 0;
  }

  push(s: SimSnapshot): void {
    const last = this.items[this.items.length - 1];
    if (last) {
      if (s.tick < last.tick) {
        throw new Error(
          `Snapshot tick must be monotonic: got ${s.tick} < ${last.tick}`,
        );
      }
      if (s.timeMs < last.timeMs) {
        // Keep a strong monotonic guarantee to make interpolation predictable
        throw new Error(
          `Snapshot timeMs must be monotonic: got ${s.timeMs} < ${last.timeMs}`,
        );
      }
    }
    this.items.push(s);
    if (this.items.length > this.capacity) {
      this.items.shift();
    }
  }

  getMostRecent(): SimSnapshot | undefined {
    return this.items[this.items.length - 1];
  }

  // Find pair [a, b] such that a.timeMs <= target <= b.timeMs, return alpha
  getBracketing(
    targetTimeMs: number,
  ): { a: SimSnapshot; b: SimSnapshot; alpha: number } | undefined {
    if (this.items.length === 0) return undefined;
    if (this.items.length === 1) {
      const only = this.items[0];
      return { a: only, b: only, alpha: 0 };
    }
    let a = this.items[0];
    for (let i = 1; i < this.items.length; i++) {
      const b = this.items[i];
      if (targetTimeMs <= b.timeMs) {
        const alpha = computeAlpha(a.timeMs, b.timeMs, targetTimeMs);
        return { a, b, alpha };
      }
      a = b;
    }
    // Beyond the newest snapshot; clamp to the last pair
    const b = this.items[this.items.length - 1];
    const alpha = computeAlpha(a.timeMs, b.timeMs, targetTimeMs);
    return { a, b, alpha };
  }
}
