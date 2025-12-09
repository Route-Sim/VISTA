import * as THREE from 'three';
import { describe, it, expect, afterEach, vi } from 'vitest';

import { Colors } from '@/app/colors';
import { createGasStation } from '@/engine/objects/gas-station';
import { createGround } from '@/engine/objects/ground';
import {
  createIntersectionMesh,
  GRAPH_NODE_HEIGHT,
} from '@/engine/objects/node';
import {
  createParkingLot,
  PARKING_BASE_HEIGHT,
  PARKING_CORRIDOR_WIDTH,
  PARKING_SPOT_DEPTH,
  PARKING_SPOT_WIDTH,
} from '@/engine/objects/parking';
import {
  createGraphRoadLine,
  createRoadMesh,
  getRoadColor,
  getRoadWidth,
  getRoadZOffset,
  GRAPH_ROAD_ELEVATION,
  LANE_WIDTH_METERS,
} from '@/engine/objects/road';
import { createSite } from '@/engine/objects/site';
import { createTree } from '@/engine/objects/tree';
import { createTruckMesh } from '@/engine/objects/truck';

describe('engine/objects', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates ground with defaults and custom options', () => {
    const defaultGround = createGround();
    expect(defaultGround).toBeInstanceOf(THREE.Mesh);
    expect(
      (defaultGround.geometry as THREE.PlaneGeometry).parameters.width,
    ).toBe(100);
    expect(defaultGround.receiveShadow).toBe(true);
    expect(defaultGround.rotation.x).toBeCloseTo(-Math.PI / 2);

    const colored = createGround({
      width: 20,
      height: 10,
      color: 0x123456,
      receiveShadow: false,
    });
    expect((colored.geometry as THREE.PlaneGeometry).parameters.height).toBe(
      10,
    );
    expect(
      (colored.material as THREE.MeshStandardMaterial).color.getHex(),
    ).toBe(0x123456);
    expect(colored.receiveShadow).toBe(false);
  });

  it('creates parking lot sized from spots and divides rows evenly', () => {
    const lot = createParkingLot({ spots: 20 }); // 10 per row -> 11 dividers per row
    expect(lot.name).toBe('ParkingLot');
    // base + 22 divider lines
    expect(lot.children.length).toBe(23);

    const base = lot.children[0] as THREE.Mesh;
    expect(base.position.y).toBeCloseTo(PARKING_BASE_HEIGHT / 2);

    // Derived dimensions from constants
    const spotsPerRow = Math.ceil(5 / 2);
    const expectedWidth = spotsPerRow * PARKING_SPOT_WIDTH;
    const expectedDepth = PARKING_SPOT_DEPTH * 2 + PARKING_CORRIDOR_WIDTH;
    const smallLot = createParkingLot({ spots: 5 });
    const smallBase = smallLot.children[0] as THREE.Mesh;
    expect(
      (smallBase.geometry as THREE.BoxGeometry).parameters.width,
    ).toBeCloseTo(expectedWidth);
    expect(
      (smallBase.geometry as THREE.BoxGeometry).parameters.depth,
    ).toBeCloseTo(expectedDepth);
  });

  it('creates trees deterministically when Math.random is mocked', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const tree = createTree();
    expect(tree.name).toBe('Tree');
    // clumpCount: 2 + floor(0.5 * 2) = 3 -> 1 trunk + 3 clumps
    expect(tree.children.length).toBe(4);
  });

  it('creates gas station, site, and truck with recognizable names', () => {
    const gas = createGasStation();
    const site = createSite();
    const truck = createTruckMesh();
    expect(gas.name).toBe('GasStation');
    expect(site.name).toBe('Site');
    expect(truck.name).toBe('Truck');
    expect(gas.children.length).toBeGreaterThan(0);
    expect(site.children.length).toBeGreaterThan(0);
    expect(truck.children.length).toBeGreaterThan(0);
  });

  it('creates intersection mesh with correct material and rotation', () => {
    const points = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(1, 0),
      new THREE.Vector2(0, 1),
    ];
    const mesh = createIntersectionMesh(points);
    expect(mesh.name).toBe('Intersection');
    expect(mesh.rotation.x).toBeCloseTo(-Math.PI / 2);
    expect(mesh.castShadow).toBe(true);
    expect(mesh.receiveShadow).toBe(true);
    expect((mesh.material as THREE.MeshStandardMaterial).color.getHex()).toBe(
      Colors.graphNode,
    );
    // ShapeGeometry height via extrusion depth
    expect(GRAPH_NODE_HEIGHT).toBeCloseTo(0.2);
  });

  it('provides road helpers with consistent values', () => {
    expect(getRoadWidth(3)).toBe(LANE_WIDTH_METERS);
    expect(getRoadColor('A')).toBe(Colors.graphRoad);
    expect(getRoadZOffset('A')).toBeGreaterThan(getRoadZOffset('D'));
    expect(getRoadZOffset('D')).toBeCloseTo(0);
    expect(GRAPH_ROAD_ELEVATION).toBeCloseTo(0.02);
  });

  it('creates road meshes and graph lines with expected defaults', () => {
    const mesh = createRoadMesh('L');
    expect(mesh.name).toBe('GraphRoadMesh');
    expect(mesh.castShadow).toBe(true);
    expect((mesh.material as THREE.MeshStandardMaterial).color.getHex()).toBe(
      Colors.graphRoad,
    );

    const line = createGraphRoadLine();
    expect(line.name).toBe('GraphRoad');
    const positionAttr = (line.geometry as THREE.BufferGeometry).getAttribute(
      'position',
    );
    expect(positionAttr.array.length).toBe(6);
  });
});
