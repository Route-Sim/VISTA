import * as THREE from "three";
import { Colors } from "../../../app/colors";

export function createAsphaltMaterial(
  color: number = Colors.roadAsphalt
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    flatShading: true,
    roughness: 0.95,
    metalness: 0.0,
  });
}

export function createRoadLineMaterial(
  color: number = Colors.roadLineWhite
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    flatShading: true,
    roughness: 0.9,
    metalness: 0.0,
  });
}
