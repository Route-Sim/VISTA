import * as THREE from "three";
import { createRoadLineMaterial } from "./materials";

export type ArcLineMarkingOptions = {
  /** Center radius of the line band (meters) */
  radius: number;
  /** Radial thickness of the line band (meters) */
  width: number;
  /** Start angle in radians (in XY plane before rotation), 0 points +X */
  startAngle?: number;
  /** Positive angle length in radians (e.g., Math.PI / 2 for 90°) */
  angle?: number;
  /** Small Y offset/thickness to lift off the surface */
  thickness?: number;
  /** Whether the arc line should be dashed */
  dashed?: boolean;
  /** Dash length along arc (meters) */
  dashLength?: number;
  /** Gap length along arc (meters) */
  gapLength?: number;
  /** Theta segments for smoothness */
  thetaSegments?: number;
  /** Radial segments for band smoothness */
  radialSegments?: number;
};

/**
 * Builds an arc (ring sector) line marking along a circular path. Returns a group oriented in XZ plane.
 */
export function createArcMarkings(opts: ArcLineMarkingOptions): THREE.Group {
  const {
    radius,
    width,
    startAngle = 0,
    angle = Math.PI / 2,
    thickness = 0.01,
    dashed = false,
    dashLength = 1.6,
    gapLength = 1.0,
    thetaSegments = 32,
    radialSegments = 1,
  } = opts;

  const inner = Math.max(0.01, radius - width * 0.5);
  const outer = Math.max(inner + 0.001, radius + width * 0.5);

  const group = new THREE.Group();
  const material = createRoadLineMaterial();

  const makeSector = (s: number, len: number): THREE.Mesh => {
    const geom = new THREE.RingGeometry(
      inner,
      outer,
      Math.max(
        8,
        Math.floor(thetaSegments * (len / (Math.PI / 2)))
      ) /* scale segs to length */,
      Math.max(1, radialSegments),
      s,
      len
    );
    // Move into XZ plane
    geom.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(geom, material);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.position.y = thickness * 0.5 + 0.001; // lift slightly to avoid z-fighting
    return mesh;
  };

  if (!dashed) {
    const mesh = makeSector(startAngle, Math.abs(angle));
    group.add(mesh);
    return group;
  }

  // Build dashed by splitting the arc into dash/gap angular spans
  const r = Math.max(0.01, radius);
  const dashAngle = Math.max(0.001, dashLength / r);
  const gapAngle = Math.max(0.001, gapLength / r);
  const span = Math.abs(angle);
  const segSpan = dashAngle + gapAngle;
  const count = Math.max(1, Math.floor(span / segSpan));
  const start = startAngle;
  for (let i = 0; i < count; i++) {
    const a = start + i * segSpan;
    const mesh = makeSector(a, dashAngle);
    group.add(mesh);
  }

  return group;
}
