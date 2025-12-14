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
import { MovementSystem } from '../systems/movement-system';

export interface SimStoreOptions {
  buffer?: SnapshotBuffer;
  initial?: SimSnapshot;
  reducers?: ReducerRegistry;
}

export class SimStore {
  private readonly buffer: SnapshotBuffer;
  private readonly reducers: ReducerRegistry;
  private readonly movementSystem = new MovementSystem();
  private working: SimDraft;
  private lastCommitted: SimSnapshot;
  private listeners = new Set<(snapshot: SimSnapshot) => void>();

  constructor(opts: SimStoreOptions = {}) {
    this.buffer = opts.buffer ?? new SnapshotBuffer(64);
    const initial = opts.initial ?? createEmptySnapshot();
    this.lastCommitted = freezeSnapshot({ ...initial });
    this.buffer.push(this.lastCommitted);
    this.working = cloneSnapshot(this.lastCommitted);
    this.reducers = opts.reducers ?? createDefaultReducerRegistry();
  }

  ingest(evt: SimEvent): void {
    console.log('[sim] Ingesting event:', evt);

    if (evt.type === 'tick.start') {
      // Calculate delta time since last tick
      const lastTime = this.working.timeMs;
      const newTime = typeof evt.timeMs === 'number' ? evt.timeMs : lastTime;

      // Prevent huge jump on first tick if initialized at 0
      const deltaMs = lastTime === 0 ? 0 : newTime - lastTime;

      this.working.tick = evt.tick;
      if (typeof evt.timeMs === 'number') this.working.timeMs = evt.timeMs;

      // Update simulation time (virtual world clock)
      this.working.simulationTime = {
        day: evt.simDay,
        time: evt.simTime,
      };

      // Run movement system
      if (deltaMs > 0) {
        this.movementSystem.update(this.working, deltaMs);
      }
      return;
    }
    if (evt.type === 'tick.end') {
      this.commitTick(evt.tick, evt.timeMs);
      return;
    }
    // Apply update to working draft
    this.reducers.dispatch(this.working, evt);
    // For structural graph updates, commit immediately so consumers can interpolate safely
    if (evt.type === 'map.created') {
      this.commitTick(this.working.tick);
    }
  }

  commitTick(tick: number, timeMs?: number): SimSnapshot {
    console.log('[sim] Committing tick:', tick, timeMs);

    this.working.tick = tick;
    if (typeof timeMs === 'number') this.working.timeMs = timeMs;
    const committed = freezeSnapshot({ ...this.working });
    this.buffer.push(committed);
    this.lastCommitted = committed;
    this.working = cloneSnapshot(committed);

    this.notifyListeners(committed);

    return committed;
  }

  getWorkingDraft(): SimDraft {
    return this.working;
  }

  getBuffer(): SnapshotBuffer {
    return this.buffer;
  }

  subscribe(callback: (snapshot: SimSnapshot) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(snapshot: SimSnapshot): void {
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }
}
