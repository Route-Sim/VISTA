import * as THREE from 'three';
import { Colors } from '@/app/colors';

export const GRAPH_NODE_HEIGHT = 0.2;

export function createIntersectionMesh(points: THREE.Vector2[]): THREE.Mesh {
  const shape = new THREE.Shape(points);
  const geometry = new THREE.ShapeGeometry(shape);

  const material = new THREE.MeshStandardMaterial({
    color: Colors.graphNode,
    flatShading: true,
    metalness: 0,
    roughness: 0.9,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = 'Intersection';
  return mesh;
}
