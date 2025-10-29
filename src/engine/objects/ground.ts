import * as THREE from 'three';
import { Colors } from '@/app/colors';

export type GroundOptions = {
  width?: number;
  height?: number;
  color?: number;
  receiveShadow?: boolean;
};

export function createGround(options: GroundOptions = {}): THREE.Mesh {
  const {
    width = 100,
    height = 100,
    color = Colors.ground,
    receiveShadow = true,
  } = options;

  const geometry = new THREE.PlaneGeometry(width, height, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    color,
    flatShading: true,
    roughness: 0.95,
    metalness: 0.0,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2; // lay flat on XZ plane
  mesh.receiveShadow = receiveShadow;

  // Slightly raise to avoid z-fighting with 0-plane if needed
  mesh.position.y = 0;

  return mesh;
}
