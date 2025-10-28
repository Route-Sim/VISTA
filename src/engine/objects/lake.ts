import * as THREE from "three";
import { Colors } from "../../app/colors";

export type LakeOptions = {
  /** Rectangle length along X (max extent), lake stays inside */
  length?: number;
  /** Rectangle width along Z (max extent), lake stays inside */
  width?: number;
  /** Irregularity factor: 0..1, higher = more jagged */
  irregularity?: number;
  /** Number of segments used to build the irregular perimeter */
  segments?: number;
  /** Color override */
  color?: number;
  /** Y offset to avoid z-fighting with ground */
  elevation?: number;
  /** Water material opacity (0..1). Defaults to 0.9 for a slight translucency */
  opacity?: number;
};

/**
 * Creates an irregular lake mesh on the XZ plane centered at (x, y).
 * The mesh is a flat shape slightly elevated to avoid z-fighting with the ground.
 */
export function createLake(
  x: number,
  y: number,
  options: LakeOptions = {}
): THREE.Mesh {
  const {
    length = 16,
    width = 12,
    irregularity = 0.35,
    segments = 24,
    color = Colors.water,
    elevation = 0.01,
    opacity = 0.9,
  } = options;

  const clampedSegments = Math.max(8, Math.floor(segments));
  const clampedIrregularity = Math.max(0, Math.min(1, irregularity));

  // Generate irregular boundary constrained within an inscribed ellipse of the rectangle
  const halfLen = Math.max(0.1, length / 2);
  const halfWid = Math.max(0.1, width / 2);
  const margin = Math.min(halfLen, halfWid) * 0.05; // keep a small margin inside the rect
  const rx = Math.max(0.01, halfLen - margin);
  const rz = Math.max(0.01, halfWid - margin);

  const shape = new THREE.Shape();
  for (let i = 0; i < clampedSegments; i++) {
    const t = (i / clampedSegments) * Math.PI * 2;
    // Max radius along direction t for ellipse (rx, rz)
    const ct = Math.cos(t);
    const st = Math.sin(t);
    const rMax = 1 / Math.sqrt((ct * ct) / (rx * rx) + (st * st) / (rz * rz));
    // Irregular inward offset (never exceed rMax)
    const inward = Math.random() * clampedIrregularity * 0.6; // 0..0.6*irr
    const r = rMax * (1 - inward);
    const px = ct * r;
    const pz = st * r;
    if (i === 0) shape.moveTo(px, pz);
    else shape.lineTo(px, pz);
  }
  shape.closePath();

  // Flat geometry from shape; rotate to lie on XZ
  const geometry2D = new THREE.ShapeGeometry(shape, clampedSegments);
  geometry2D.rotateX(-Math.PI / 2);
  const geometry: THREE.BufferGeometry = geometry2D;

  const material = new THREE.MeshStandardMaterial({
    color,
    transparent: opacity < 1,
    opacity,
    flatShading: true,
    roughness: 0.9,
    metalness: 0.0,
  });

  const lake = new THREE.Mesh(geometry, material);
  lake.position.set(x, elevation, y);
  lake.receiveShadow = false;
  lake.castShadow = false;

  // Ensure normals are available
  geometry.computeVertexNormals?.();

  return lake;
}
