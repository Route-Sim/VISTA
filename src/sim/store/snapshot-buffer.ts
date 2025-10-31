import { type SimulationSnapshot } from '@/sim/state';

export interface SnapshotEntry {
  readonly timestamp: number;
  readonly snapshot: SimulationSnapshot;
}

export class SnapshotBuffer {
  private readonly limit: number;
  private readonly entries: SnapshotEntry[] = [];

  constructor(limit = 2) {
    this.limit = Math.max(limit, 1);
  }

  public push(entry: SnapshotEntry): void {
    this.entries.push(entry);
    this.compact();
  }

  public latest(): SnapshotEntry | undefined {
    return this.entries.at(-1);
  }

  public previous(): SnapshotEntry | undefined {
    return this.entries.length > 1 ? this.entries.at(-2) : undefined;
  }

  public list(): readonly SnapshotEntry[] {
    return [...this.entries];
  }

  private compact(): void {
    while (this.entries.length > this.limit) {
      this.entries.shift();
    }
  }
}
