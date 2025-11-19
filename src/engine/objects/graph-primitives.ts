import * as THREE from 'three';

import { Colors } from '@/app/colors';
import type { RoadClass } from '@/sim/domain/enums';

export const GRAPH_NODE_RADIUS = 0.4;
export const GRAPH_NODE_HEIGHT = 0.2;
export const GRAPH_ROAD_ELEVATION = 0.02;

export const LANE_WIDTH_METERS = 4;
export const ROAD_THICKNESS = 0.05;

const NODE_SEGMENTS = 12;

const nodeMaterialParams: THREE.MeshStandardMaterialParameters = {
  color: Colors.graphNode,
  flatShading: true,
  metalness: 0,
  roughness: 0.9,
};

// Shared geometry for all roads to enable instancing later if needed,
// or just to save memory.
// 1x1x1 box, centered.
// We will scale:
// x: width (lanes * lane_width)
// y: thickness
// z: length
const sharedRoadGeometry = new THREE.BoxGeometry(1, 1, 1);

export function getRoadColor(roadClass: RoadClass): number {
  switch (roadClass) {
    case 'A':
      return Colors.roadClassA;
    case 'S':
      return Colors.roadClassS;
    case 'GP':
      return Colors.roadClassGP;
    case 'G':
      return Colors.roadClassG;
    case 'Z':
      return Colors.roadClassZ;
    case 'L':
      return Colors.roadClassL;
    case 'D':
      return Colors.roadClassD;
    default:
      return Colors.graphRoad;
  }
}

export function createGraphNodeMesh(): THREE.Mesh {
  const geometry = new THREE.CylinderGeometry(
    GRAPH_NODE_RADIUS,
    GRAPH_NODE_RADIUS,
    GRAPH_NODE_HEIGHT,
    NODE_SEGMENTS,
  );
  geometry.rotateX(Math.PI / 2);

  const material = new THREE.MeshStandardMaterial(nodeMaterialParams);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.name = 'GraphNode';
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
