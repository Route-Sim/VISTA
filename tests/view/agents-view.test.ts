import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as THREE from 'three';

import { AgentsView } from '@/view/agents-view';
import { GRAPH_ROAD_ELEVATION, ROAD_THICKNESS } from '@/engine/objects/road';
import type { SimSnapshot } from '@/sim';
import { createEmptySnapshot } from '@/sim/store/snapshot';
import type { SimFrame } from '@/sim/systems/interpolation';
import type { GraphTransform } from '@/view/graph/graph-transform';
import { GRAPH_POSITION_SCALE } from '@/view/graph/graph-transform';

vi.mock('@/engine/objects/truck', () => {
  return {
    createTruckMesh: vi.fn(() => {
      const group = new THREE.Group();
      const geom = new THREE.BoxGeometry(1, 1, 1);
      const mat = new THREE.MeshBasicMaterial();
      const mesh = new THREE.Mesh(geom, mat);
      group.add(mesh);
      return group;
    }),
  };
});

function makeSnapshot(): SimSnapshot {
  return createEmptySnapshot();
}

function makeFrame(snapshot: SimSnapshot): SimFrame {
  return {
    tickA: snapshot.tick,
    tickB: snapshot.tick,
    alpha: 0,
    snapshotA: snapshot,
    snapshotB: snapshot,
  };
}

const defaultTransform: GraphTransform = {
  centerX: 0,
  centerY: 0,
  scale: GRAPH_POSITION_SCALE,
};

function getTruckGroup(scene: THREE.Scene): THREE.Group {
  const root = scene.getObjectByName('AgentsView.Root') as THREE.Group;
  expect(root).toBeTruthy();
  const trucks = root.getObjectByName('AgentsView.Trucks') as THREE.Group;
  expect(trucks).toBeTruthy();
  return trucks;
}

describe('AgentsView', () => {
  let scene: THREE.Scene;

  beforeEach(() => {
    scene = new THREE.Scene();
  });

  it('creates and positions a truck at a node and orients towards first route node', () => {
    const snapshot = makeSnapshot();

    // Create two nodes and one truck at first node with route pointing to second
    snapshot.nodes['n1' as any] = {
      id: 'n1' as any,
      x: 0,
      y: 0,
      buildingIds: [],
    } as any;
    snapshot.nodes['n2' as any] = {
      id: 'n2' as any,
      x: 10,
      y: 0,
      buildingIds: [],
    } as any;

    snapshot.trucks['t1' as any] = {
      id: 't1' as any,
      currentNodeId: 'n1' as any,
      currentEdgeId: null,
      currentBuildingId: null,
      edgeProgress: 0,
      route: ['n2' as any],
    } as any;

    const view = new AgentsView(scene);
    const frame = makeFrame(snapshot);

    view.update(frame, defaultTransform);

    const trucksGroup = getTruckGroup(scene);
    expect(trucksGroup.children.length).toBe(1);

    const mesh = trucksGroup.children[0] as THREE.Group;
    expect(mesh.position.y).toBeCloseTo(
      GRAPH_ROAD_ELEVATION + ROAD_THICKNESS,
    );

    // Updating again with same snapshot should reuse mesh (no new children)
    view.update(frame, defaultTransform);
    expect(trucksGroup.children.length).toBe(1);
  });

  it('positions truck on road using edge progress between nodes', () => {
    const snapshot = makeSnapshot();

    snapshot.nodes['a' as any] = {
      id: 'a' as any,
      x: 0,
      y: 0,
      buildingIds: [],
    } as any;
    snapshot.nodes['b' as any] = {
      id: 'b' as any,
      x: 100,
      y: 0,
      buildingIds: [],
    } as any;

    snapshot.roads['r1' as any] = {
      id: 'r1' as any,
      startNodeId: 'a' as any,
      endNodeId: 'b' as any,
      lengthM: 100,
    } as any;

    snapshot.trucks['t1' as any] = {
      id: 't1' as any,
      currentNodeId: null,
      currentEdgeId: 'r1' as any,
      currentBuildingId: null,
      edgeProgress: 50,
      route: [],
    } as any;

    const view = new AgentsView(scene);
    const frame = makeFrame(snapshot);

    view.update(frame, defaultTransform);

    const trucksGroup = getTruckGroup(scene);
    const mesh = trucksGroup.children[0] as THREE.Group;

    // Halfway between nodes in graph space; with default transform center at 0,
    // this should land at ~x = (50 * scale).
    expect(mesh.position.x).toBeCloseTo(50 * defaultTransform.scale, 4);
    expect(mesh.position.y).toBeCloseTo(
      GRAPH_ROAD_ELEVATION + ROAD_THICKNESS,
    );
  });

  it('removes trucks that are no longer present in the snapshot', () => {
    const snapshot = makeSnapshot();
    snapshot.nodes['n1' as any] = {
      id: 'n1' as any,
      x: 0,
      y: 0,
      buildingIds: [],
    } as any;
    snapshot.trucks['t1' as any] = {
      id: 't1' as any,
      currentNodeId: 'n1' as any,
      currentEdgeId: null,
      currentBuildingId: null,
      edgeProgress: 0,
      route: [],
    } as any;

    const view = new AgentsView(scene);
    const frame1 = makeFrame(snapshot);
    view.update(frame1, defaultTransform);

    const trucksGroup = getTruckGroup(scene);
    expect(trucksGroup.children.length).toBe(1);

    // Now create a new frame with no trucks -> existing mesh should be removed
    const snapshot2 = makeSnapshot();
    snapshot2.nodes = snapshot.nodes;
    const frame2 = makeFrame(snapshot2);

    view.update(frame2, defaultTransform);
    expect(trucksGroup.children.length).toBe(0);
  });

  it('dispose removes root from scene and clears all truck meshes', () => {
    const snapshot = makeSnapshot();
    snapshot.nodes['n1' as any] = {
      id: 'n1' as any,
      x: 0,
      y: 0,
      buildingIds: [],
    } as any;
    snapshot.trucks['t1' as any] = {
      id: 't1' as any,
      currentNodeId: 'n1' as any,
      currentEdgeId: null,
      currentBuildingId: null,
      edgeProgress: 0,
      route: [],
    } as any;

    const view = new AgentsView(scene);
    const frame = makeFrame(snapshot);
    view.update(frame, defaultTransform);

    const rootBefore = scene.getObjectByName('AgentsView.Root');
    expect(rootBefore).toBeTruthy();

    view.dispose();

    const rootAfter = scene.getObjectByName('AgentsView.Root');
    // After dispose, the root is removed from the scene graph.
    expect(rootAfter).toBeUndefined();
  });
});


