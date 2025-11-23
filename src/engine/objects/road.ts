import * as THREE from 'three';
import { Colors } from '@/app/colors';
import type { RoadClass } from '@/sim/domain/enums';

export const LANE_WIDTH_METERS = 4;
export const ROAD_THICKNESS = 0.05;
export const GRAPH_ROAD_ELEVATION = 0.02;

// Small vertical offset step to resolve z-fighting between road classes
const ROAD_Z_LAYER_STEP = 0.002;

const ROAD_CLASS_PRIORITY: Record<RoadClass, number> = {
  D: 0,
  L: 1,
  Z: 2,
  G: 3,
  GP: 4,
  S: 5,
  A: 6,
};

// Shared geometry for all roads
const sharedRoadGeometry = new THREE.BoxGeometry(1, 1, 1);

export function getRoadWidth(_lanes: number): number {
  return LANE_WIDTH_METERS;
}

export function getRoadColor(_roadClass: RoadClass): number {
  return Colors.graphRoad;
}

export function getRoadZOffset(roadClass: RoadClass): number {
  const priority = ROAD_CLASS_PRIORITY[roadClass] ?? 0;
  return priority * ROAD_Z_LAYER_STEP;
}

export function createRoadMesh(roadClass: RoadClass): THREE.Mesh {
  const color = getRoadColor(roadClass);
  const material = new THREE.MeshStandardMaterial({
    color,
    flatShading: true,
    metalness: 0,
    roughness: 0.9,
  });

  const mesh = new THREE.Mesh(sharedRoadGeometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = 'GraphRoadMesh';
  return mesh;
}

// Deprecated: will be replaced by road meshes
const roadMaterialParams: THREE.LineBasicMaterialParameters = {
  color: Colors.graphRoad,
  linewidth: 10,
};

export function createGraphRoadLine(): THREE.Line {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(6), 3),
  );

  const material = new THREE.LineBasicMaterial(roadMaterialParams);
  const line = new THREE.Line(geometry, material);
  line.name = 'GraphRoad';
  return line;
}
