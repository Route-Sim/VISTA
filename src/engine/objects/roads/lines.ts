import * as THREE from "three";
import { createRoadLineMaterial } from "./materials";

export type LineMarkingOptions = {
  length: number; // world meters
  width: number; // stripe width in meters
  thickness?: number; // small Y thickness to avoid z-fighting
  dashed?: boolean;
  dashLength?: number;
  gapLength?: number;
};

/**
 * Builds a centerline (or sideline) marking group along the X axis, centered at origin.
 * Lines lie on the XZ plane; caller positions and rotates the returned group.
 */
export function createLineMarkings(opts: LineMarkingOptions): THREE.Group {
  const {
    length,
    width,
    thickness = 0.01,
    dashed = false,
    dashLength = 1.5,
    gapLength = 1.0,
  } = opts;

  const group = new THREE.Group();
  const material = createRoadLineMaterial();

  if (!dashed) {
    const geom = new THREE.BoxGeometry(length, thickness, width);
    const mesh = new THREE.Mesh(geom, material);
    mesh.position.y = thickness * 0.5 + 0.001; // float slightly to avoid z-fighting
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    group.add(mesh);
    return group;
  }

  const segmentSpan = dashLength + gapLength;
  const count = Math.max(1, Math.floor(length / segmentSpan));
  const totalSpan = count * segmentSpan;
  const startX = -totalSpan / 2 + dashLength / 2;
  for (let i = 0; i < count; i++) {
    const x = startX + i * segmentSpan;
    const geom = new THREE.BoxGeometry(dashLength, thickness, width);
    const mesh = new THREE.Mesh(geom, material);
    mesh.position.set(x, thickness * 0.5 + 0.001, 0);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    group.add(mesh);
  }

  return group;
}
