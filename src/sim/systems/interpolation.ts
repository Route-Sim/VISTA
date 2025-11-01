import type { SimSnapshot } from '../store/snapshot';

export interface SimFrame {
  tickA: number;
  tickB: number;
  alpha: number; // 0..1 between snapshots A and B
  snapshotA: SimSnapshot;
  snapshotB: SimSnapshot;
}

// Skeleton for future interpolation. For now, we simply surface the two
// bracketing snapshots with an alpha factor; view systems can choose how to
// apply this (e.g., tween truck positions) without mutating the snapshots.
export function interpolateSnapshots(
  a: SimSnapshot,
  b: SimSnapshot,
  alpha: number,
): SimFrame {
  const clamped = alpha < 0 ? 0 : alpha > 1 ? 1 : alpha;
  return {
    tickA: a.tick,
    tickB: b.tick,
    alpha: clamped,
    snapshotA: a,
    snapshotB: b,
  };
}
