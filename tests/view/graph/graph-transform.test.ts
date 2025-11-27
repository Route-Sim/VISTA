import { describe, it, expect } from 'vitest';
import * as THREE from 'three';

import {
  GRAPH_POSITION_SCALE,
  computeGraphTransform,
  normalizePoint,
  toVector3,
} from '@/view/graph/graph-transform';
import { GRAPH_ROAD_ELEVATION } from '@/engine/objects/road';
import type { SimSnapshot } from '@/sim';
import { createEmptySnapshot } from '@/sim/store/snapshot';

function makeSnapshotWithNodes(
  nodes: Array<{ id: string; x: number; y: number }>,
): SimSnapshot {
  const snapshot = createEmptySnapshot();
  for (const n of nodes) {
    snapshot.nodes[n.id as any] = {
      id: n.id as any,
      x: n.x,
      y: n.y,
      buildingIds: [],
    } as any;
  }
  return snapshot;
}

describe('graph-transform', () => {
  it('computeGraphTransform should return defaults for empty snapshot', () => {
    const snapshot = createEmptySnapshot();
    const transform = computeGraphTransform(snapshot);

    expect(transform.centerX).toBe(0);
    expect(transform.centerY).toBe(0);
    expect(transform.scale).toBe(GRAPH_POSITION_SCALE);
  });

  it('computeGraphTransform should compute center of node bounds', () => {
    const snapshot = makeSnapshotWithNodes([
      { id: 'n1', x: 0, y: 0 },
      { id: 'n2', x: 10, y: 20 },
      { id: 'n3', x: -10, y: -20 },
    ]);

    const transform = computeGraphTransform(snapshot);

    // minX=-10, maxX=10 => centerX=0; minY=-20, maxY=20 => centerY=0
    expect(transform.centerX).toBe(0);
    expect(transform.centerY).toBe(0);
    expect(transform.scale).toBe(GRAPH_POSITION_SCALE);
  });

  it('toVector3 should normalize coordinates and set y to road elevation', () => {
    const snapshot = makeSnapshotWithNodes([{ id: 'n1', x: 10, y: 20 }]);
    const transform = computeGraphTransform(snapshot);
    const node = snapshot.nodes['n1' as any]!;

    const target = new THREE.Vector3();
    const result = toVector3(node, transform, target);

    // Node is at center -> normalized to (0, 0) in XZ
    expect(result.x).toBeCloseTo(0);
    expect(result.z).toBeCloseTo(0);
    expect(result.y).toBe(GRAPH_ROAD_ELEVATION);
  });

  it('normalizePoint should apply same normalization as toVector3 (ignoring elevation)', () => {
    const snapshot = makeSnapshotWithNodes([
      { id: 'n1', x: 0, y: 0 },
      { id: 'n2', x: 10, y: 0 },
    ]);
    const transform = computeGraphTransform(snapshot);

    const p = normalizePoint(10, 0, transform);
    // With nodes at x=0 and x=10, centerX=5; normalizedX = (10-5)*scale
    expect(p.x).toBeCloseTo(5 * transform.scale);
    expect(p.y).toBeCloseTo(0);
  });
});
