import type { SimEvent } from '../events';
import {
  cloneSnapshot,
  createEmptySnapshot,
  freezeSnapshot,
  type SimDraft,
  type SimSnapshot,
} from './snapshot';
import { SnapshotBuffer } from './snapshot-buffer';
import { ReducerRegistry } from './reducer-registry';
import { createDefaultReducerRegistry } from './reducers';

export interface SimStoreOptions {
  buffer?: SnapshotBuffer;
  initial?: SimSnapshot;
  reducers?: ReducerRegistry;
}

export class SimStore {
  private readonly buffer: SnapshotBuffer;
  private readonly reducers: ReducerRegistry;
  private working: SimDraft;
  private lastCommitted: SimSnapshot;

  constructor(opts: SimStoreOptions = {}) {
    this.buffer = opts.buffer ?? new SnapshotBuffer(64);
    const initial = opts.initial ?? createEmptySnapshot();
    this.lastCommitted = freezeSnapshot({ ...initial });
    this.buffer.push(this.lastCommitted);
    this.working = cloneSnapshot(this.lastCommitted);
    this.reducers = opts.reducers ?? createDefaultReducerRegistry();
  }

  ingest(evt: SimEvent): void {
    if (evt.type === 'tick') {
      this.commitTick(evt.tick, evt.timeMs);
      return;
    }
    // Apply update to working draft
    this.reducers.dispatch(this.working, evt);
  }

  commitTick(tick: number, timeMs?: number): SimSnapshot {
    this.working.tick = tick;
    if (typeof timeMs === 'number') this.working.timeMs = timeMs;
    const committed = freezeSnapshot({ ...this.working });
    this.buffer.push(committed);
    this.lastCommitted = committed;
    this.working = cloneSnapshot(committed);
    return committed;
  }

  getWorkingDraft(): SimDraft {
    return this.working;
  }

  getBuffer(): SnapshotBuffer {
    return this.buffer;
  }
}
