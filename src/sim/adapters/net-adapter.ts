import type { SimEvent } from '../events';
import type { SimSnapshot } from '../store/snapshot';
import { createEmptySnapshot } from '../store/snapshot';

// Wire → Domain mapping stubs. These will be implemented once the @net schema
// is finalized. Keeping the signatures stable allows @net and @sim to evolve
// independently while the view consumes typed events and snapshots.

export function mapNetEvent(_payload: unknown): SimEvent | undefined {
  // TODO: Implement according to @net protocol
  return undefined;
}

export function mapNetSnapshot(_payload: unknown): SimSnapshot {
  // TODO: Implement according to @net protocol
  return createEmptySnapshot();
}

export function mapNetDelta(_payload: unknown): SimEvent[] {
  // TODO: Implement according to @net protocol
  return [];
}
