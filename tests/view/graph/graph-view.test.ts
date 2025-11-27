import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as THREE from 'three';

import { GraphView } from '@/view/graph/graph-view';
import { createEmptySnapshot } from '@/sim/store/snapshot';
import type { SimSnapshot } from '@/sim';
import type { SimFrame } from '@/sim/systems/interpolation';
import { GRAPH_POSITION_SCALE } from '@/view/graph/graph-transform';

vi.mock('@/engine/objects/node', () => {
  return {
    createIntersectionMesh: (points: THREE.Vector2[]) => {
      const shape = new THREE.Shape(points);
      const geom = new THREE.ShapeGeometry(shape);
      const mat = new THREE.MeshBasicMaterial();
      return new THREE.Mesh(geom, mat);
    },
  };
});

vi.mock('@/engine/objects/road', () => {
  return {
    GRAPH_ROAD_ELEVATION: 0,
    ROAD_THICKNESS: 0.1,
    createRoadMesh: () => {
      const geom = new THREE.BoxGeometry(1, 0.1, 1);
      const mat = new THREE.MeshBasicMaterial();
      return new THREE.Mesh(geom, mat);
    },
    getRoadZOffset: () => 0,
    getRoadWidth: (lanes: number) => lanes * 4,
  };
});

vi.mock('@/engine/objects/site', () => {
  return {
    createSite: () => {
      const geom = new THREE.BoxGeometry(1, 1, 1);
      const mat = new THREE.MeshBasicMaterial();
      const group = new THREE.Group();
      group.add(new THREE.Mesh(geom, mat));
      return group;
    },
  };
});

vi.mock('@/engine/objects/parking', () => {
  return {
    createParkingLot: () => {
      const geom = new THREE.BoxGeometry(1, 0.1, 1);
      const mat = new THREE.MeshBasicMaterial();
      const group = new THREE.Group();
      group.add(new THREE.Mesh(geom, mat));
      return group;
    },
    PARKING_SPOT_WIDTH: 2,
    PARKING_SPOT_DEPTH: 4,
    PARKING_CORRIDOR_WIDTH: 3,
  };
});

vi.mock('@/engine/objects/tree', () => {
  return {
    createTree: () => {
      const geom = new THREE.ConeGeometry(0.5, 1);
      const mat = new THREE.MeshBasicMaterial();
      const group = new THREE.Group();
      group.add(new THREE.Mesh(geom, mat));
      return group;
    },
  };
});

function makeFrame(snapshot: SimSnapshot): SimFrame {
  return {
    tickA: snapshot.tick,
    tickB: snapshot.tick,
    alpha: 0,
    snapshotA: snapshot,
    snapshotB: snapshot,
  };
}

describe('GraphView', () => {
  let scene: THREE.Scene;

  beforeEach(() => {
    scene = new THREE.Scene();
  });

  it('builds intersections and roads for a simple junction and cleans up dead-ends', () => {
    const snapshot = createEmptySnapshot();

    // Create three nodes: center and two connected nodes to form a junction
    snapshot.nodes['center' as any] = {
      id: 'center' as any,
      x: 0,
      y: 0,
      buildingIds: [],
    } as any;
    snapshot.nodes['n1' as any] = {
      id: 'n1' as any,
      x: 10,
      y: 0,
      buildingIds: [],
    } as any;
    snapshot.nodes['n2' as any] = {
      id: 'n2' as any,
      x: 0,
      y: 10,
      buildingIds: [],
    } as any;

    // Two roads sharing the center node: center-n1 and center-n2
    snapshot.roads['r1' as any] = {
      id: 'r1' as any,
      startNodeId: 'center' as any,
      endNodeId: 'n1' as any,
      lengthM: 10,
      lanes: 1,
    } as any;
    snapshot.roads['r2' as any] = {
      id: 'r2' as any,
      startNodeId: 'center' as any,
      endNodeId: 'n2' as any,
      lengthM: 10,
      lanes: 1,
    } as any;

    const frame = makeFrame(snapshot);
    const view = new GraphView(scene);

    view.update(frame);

    const root = scene.getObjectByName('GraphView.Root') as THREE.Group;
    expect(root).toBeTruthy();

    const intersections = root.getObjectByName(
      'GraphView.Intersections',
    ) as THREE.Group;
    const roads = root.getObjectByName('GraphView.Roads') as THREE.Group;

    expect(intersections.children.length).toBeGreaterThanOrEqual(1);
    expect(roads.children.length).toBe(2);
  });

  it('syncs buildings (site and parking) and trees for a small graph', () => {
    const snapshot = createEmptySnapshot();

    snapshot.nodes['n1' as any] = {
      id: 'n1' as any,
      x: 0,
      y: 0,
      buildingIds: [],
    } as any;
    snapshot.nodes['n2' as any] = {
      id: 'n2' as any,
      x: 20,
      y: 0,
      buildingIds: [],
    } as any;

    snapshot.roads['r1' as any] = {
      id: 'r1' as any,
      startNodeId: 'n1' as any,
      endNodeId: 'n2' as any,
      lengthM: 20,
      lanes: 1,
    } as any;

    snapshot.buildings['site1' as any] = {
      id: 'site1' as any,
      nodeId: 'n1' as any,
      kind: 'site',
      truckIds: [],
      packageIds: [],
    } as any;

    snapshot.buildings['park1' as any] = {
      id: 'park1' as any,
      nodeId: 'n1' as any,
      kind: 'parking',
      truckIds: [],
      capacity: 10,
    } as any;

    const frame = makeFrame(snapshot);
    const view = new GraphView(scene);

    view.update(frame);

    const root = scene.getObjectByName('GraphView.Root') as THREE.Group;
    expect(root).toBeTruthy();

    const sites = root.getObjectByName('GraphView.Sites') as THREE.Group;
    const parkings = root.getObjectByName('GraphView.Parkings') as THREE.Group;
    const trees = root.getObjectByName('GraphView.Trees') as THREE.Group;

    expect(sites.children.length).toBe(1);
    expect(parkings.children.length).toBe(1);
    expect(trees.children.length).toBeGreaterThan(0);

    // Calling update again should reuse structures and just resync transforms
    const frame2: SimFrame = {
      tickA: frame.tickA,
      tickB: frame.tickB,
      alpha: 0,
      snapshotA: snapshot,
      snapshotB: { ...snapshot, config: { ...snapshot.config, speed: 2 } },
    };

    view.update(frame2, {
      centerX: 0,
      centerY: 0,
      scale: GRAPH_POSITION_SCALE * 2,
    });

    expect(sites.children.length).toBe(1);
    expect(parkings.children.length).toBe(1);
    expect(trees.children.length).toBeGreaterThan(0);
  });
});


