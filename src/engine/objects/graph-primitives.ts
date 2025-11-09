import * as THREE from 'three';

import { Colors } from '@/app/colors';

export const GRAPH_NODE_RADIUS = 0.4;
export const GRAPH_NODE_HEIGHT = 0.2;
export const GRAPH_ROAD_ELEVATION = 0.02;

const NODE_SEGMENTS = 12;

const nodeMaterialParams: THREE.MeshStandardMaterialParameters = {
  color: Colors.graphNode,
  flatShading: true,
  metalness: 0,
  roughness: 0.9,
};

const roadMaterialParams: THREE.LineBasicMaterialParameters = {
  color: Colors.graphRoad,
  linewidth: 10,
};

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
