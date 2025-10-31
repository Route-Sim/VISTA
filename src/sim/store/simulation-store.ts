import { SnapshotBuffer } from '@/sim/store/snapshot-buffer';
import { SimulationState } from '@/sim/store/simulation-state';
import { SimulationSnapshot } from '@/sim/state';

export type SimulationSubscriber = (snapshot: SimulationSnapshot) => void;

export interface SimulationStoreOptions {
  readonly buffer?: SnapshotBuffer;
}

export class SimulationStore {
  private state: SimulationState;
  private readonly subscribers = new Set<SimulationSubscriber>();
  private readonly buffer?: SnapshotBuffer;

  constructor(
    initialState: SimulationState = SimulationState.empty(),
    options: SimulationStoreOptions = {},
  ) {
    this.state = initialState;
    this.buffer = options.buffer;
  }

  public get snapshot(): SimulationSnapshot {
    return this.state.snapshot();
  }

  public subscribe(subscriber: SimulationSubscriber): () => void {
    this.subscribers.add(subscriber);
    subscriber(this.snapshot);

    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  public replace(state: SimulationState): void {
    this.state = state;
    this.emit();
  }

  public update(mutator: (state: SimulationState) => SimulationState): void {
    this.state = mutator(this.state);
    this.emit();
  }

  private emit(): void {
    const snapshot = this.state.snapshot();
    const timestamp =
      typeof performance !== 'undefined' ? performance.now() : Date.now();
    this.buffer?.push({ snapshot, timestamp });
    for (const subscriber of this.subscribers) {
      subscriber(snapshot);
    }
  }
}

