import * as THREE from "three";
import { Colors } from "../../app/colors";
import { loadPoliigonGrass4585 } from "../loaders/textures";

export type GroundOptions = {
  width?: number;
  height?: number;
  color?: number;
  receiveShadow?: boolean;
  useTexture?: boolean;
  tileWorldSize?: number;
};

export function createGround(options: GroundOptions = {}): THREE.Mesh {
  const {
    width = 100,
    height = 100,
    color = Colors.ground,
    receiveShadow = true,
    useTexture = true,
    tileWorldSize = 4,
  } = options;

  const geometry = new THREE.PlaneGeometry(width, height, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    color,
    flatShading: true,
    roughness: 0.95,
    metalness: 0.0,
  });
  if (useTexture) {
    const repeatX = width / tileWorldSize;
    const repeatY = height / tileWorldSize;
    const maps = loadPoliigonGrass4585(repeatX, repeatY);
    material.map = maps.baseColor;
    material.normalMap = maps.normal;
    material.roughnessMap = maps.roughness;
    material.color.set(0xffffff);
    material.metalness = 0.0;
    material.needsUpdate = true;
  }
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2; // lay flat on XZ plane
  mesh.receiveShadow = receiveShadow;

  // Slightly raise to avoid z-fighting with 0-plane if needed
  mesh.position.y = 0;

  // Material tuned for warm low‑poly look when not using textures
  if (!useTexture) {
    material.roughness = 0.95;
    material.metalness = 0.0;
    material.flatShading = true;
    material.needsUpdate = true;
  }

  return mesh;
}
