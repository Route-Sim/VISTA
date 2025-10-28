import * as THREE from "three";
import { Colors } from "../../app/colors";

export type TreeOptions = {
  /** Trunk height in meters */
  trunkHeight?: number;
  /** Top radius of trunk (taper) */
  trunkRadiusTop?: number;
  /** Bottom radius of trunk */
  trunkRadiusBottom?: number;
  /** Radial segments for trunk (keep low for faceting) */
  trunkRadialSegments?: number;
  /** Approximate radius of each canopy lobe */
  canopyRadius?: number;
  /** Number of canopy lobes arranged around the crown (excluding center) */
  canopyLobes?: number;
  /** Enable minor random variation on lobe placement and scale */
  randomize?: boolean;
  /** Whether meshes should cast shadow */
  castShadow?: boolean;
};

/**
 * Creates a stylized low‑poly tree composed of a tapered trunk and a multi‑lobe canopy.
 * Returns a THREE.Group positioned at origin; caller positions/rotates as needed.
 */
export function createTree(options: TreeOptions = {}): THREE.Group {
  const {
    trunkHeight = 2.4,
    trunkRadiusTop = 0.16,
    trunkRadiusBottom = 0.28,
    trunkRadialSegments = 10,
    canopyRadius = 0.9,
    canopyLobes = 3,
    randomize = true,
    castShadow = true,
  } = options;

  // Materials tuned to warm, low‑poly look
  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: Colors.trunk,
    flatShading: true,
    roughness: 0.92,
    metalness: 0.0,
  });
  const canopyMaterial = new THREE.MeshStandardMaterial({
    color: Colors.foliage,
    flatShading: true,
    roughness: 0.95,
    metalness: 0.0,
  });

  const group = new THREE.Group();

  // Trunk: slightly tapered cylinder
  const trunkGeometry = new THREE.CylinderGeometry(
    Math.max(0.01, trunkRadiusTop),
    Math.max(0.01, trunkRadiusBottom),
    Math.max(0.1, trunkHeight),
    Math.max(6, Math.floor(trunkRadialSegments)),
    1,
    false
  );
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = trunkHeight / 2; // base at y=0
  trunk.castShadow = castShadow;
  trunk.receiveShadow = false;
  group.add(trunk);

  // Canopy: center lobe + ring of side lobes
  const canopyGroup = new THREE.Group();
  const crownBaseY = trunkHeight * 0.9; // slightly embedded into canopy

  // Center lobe (slightly larger)
  const centerRadius = canopyRadius * 1.08;
  const centerGeom = new THREE.IcosahedronGeometry(
    Math.max(0.05, centerRadius),
    0
  );
  const center = new THREE.Mesh(centerGeom, canopyMaterial);
  center.position.y = crownBaseY + centerRadius * 0.65;
  center.castShadow = castShadow;
  center.receiveShadow = false;
  canopyGroup.add(center);

  // Side lobes arranged around
  const ringRadius = canopyRadius * 0.6;
  const lobeCount = Math.max(0, Math.floor(canopyLobes));
  const phase = randomize ? Math.random() * Math.PI * 2 : 0;
  for (let i = 0; i < lobeCount; i++) {
    const t = (i / lobeCount) * Math.PI * 2 + phase;
    const jitterAngle = randomize ? (Math.random() - 0.5) * 0.3 : 0; // ±0.15 rad
    const angle = t + jitterAngle;
    const r = ringRadius * (randomize ? 0.9 + Math.random() * 0.25 : 1);
    const lx = Math.cos(angle) * r;
    const lz = Math.sin(angle) * r;
    const scale = canopyRadius * (randomize ? 0.85 + Math.random() * 0.35 : 1);
    const geom = new THREE.IcosahedronGeometry(Math.max(0.04, scale), 0);
    const lobe = new THREE.Mesh(geom, canopyMaterial);
    lobe.position.set(
      lx,
      crownBaseY + canopyRadius * (randomize ? 0.4 + Math.random() * 0.5 : 0.6),
      lz
    );
    lobe.rotation.y = randomize ? Math.random() * Math.PI * 2 : 0;
    lobe.castShadow = castShadow;
    lobe.receiveShadow = false;
    canopyGroup.add(lobe);
  }

  group.add(canopyGroup);

  return group;
}
