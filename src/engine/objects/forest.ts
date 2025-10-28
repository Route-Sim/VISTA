import * as THREE from "three";
import { createTree } from "./tree";

export type ForestOptions = {
  /** Rectangle length along X (max extent), forest stays inside */
  length?: number;
  /** Rectangle width along Z (max extent), forest stays inside */
  width?: number;
  /** Minimum separation between trees (meters) */
  minDistance?: number;
  /** Attempts per active sample in Bridson's algorithm */
  attemptsPerPoint?: number;
  /** Keep trees away from rectangle edges (meters) */
  edgePadding?: number;
  /** Variation ranges for generated trees */
  trunkHeightRange?: [number, number];
  canopyRadiusRange?: [number, number];
  canopyLobesRange?: [number, number];
  /** Whether trees cast shadow */
  castShadow?: boolean;
};

type Vec2 = [number, number];

function randomInRange(min: number, max: number): number {
  if (max < min) return min;
  return min + Math.random() * (max - min);
}

function randomIntInRange(min: number, max: number): number {
  const lo = Math.ceil(Math.min(min, max));
  const hi = Math.floor(Math.max(min, max));
  return Math.floor(lo + Math.random() * (hi - lo + 1));
}

/** Poisson disk sampling inside a centered rectangle using Bridson's algorithm */
function poissonSampleRect(
  width: number,
  height: number,
  minDist: number,
  k: number
): Vec2[] {
  const samples: Vec2[] = [];
  const active: number[] = [];
  const cellSize = minDist / Math.SQRT2;
  const gridW = Math.max(1, Math.ceil(width / cellSize));
  const gridH = Math.max(1, Math.ceil(height / cellSize));
  const grid = new Array<number>(gridW * gridH).fill(-1);

  const halfW = width / 2;
  const halfH = height / 2;

  const toGrid = (p: Vec2): [number, number] => {
    const gx = Math.floor((p[0] + halfW) / cellSize);
    const gz = Math.floor((p[1] + halfH) / cellSize);
    return [gx, gz];
  };

  const inBounds = (p: Vec2): boolean =>
    p[0] >= -halfW && p[0] <= halfW && p[1] >= -halfH && p[1] <= halfH;

  const isFarEnough = (p: Vec2): boolean => {
    const [gx, gz] = toGrid(p);
    for (let dz = -1; dz <= 1; dz++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = gx + dx;
        const nz = gz + dz;
        if (nx < 0 || nz < 0 || nx >= gridW || nz >= gridH) continue;
        const ni = grid[nz * gridW + nx];
        if (ni === -1) continue;
        const op = samples[ni];
        const dxp = op[0] - p[0];
        const dzp = op[1] - p[1];
        if (dxp * dxp + dzp * dzp < minDist * minDist) return false;
      }
    }
    return true;
  };

  const addSample = (p: Vec2): void => {
    const [gx, gz] = toGrid(p);
    samples.push(p);
    active.push(samples.length - 1);
    grid[gz * gridW + gx] = samples.length - 1;
  };

  // Seed with an initial random sample
  addSample([randomInRange(-halfW, halfW), randomInRange(-halfH, halfH)]);

  while (active.length > 0) {
    const ai = Math.floor(Math.random() * active.length);
    const si = active[ai];
    const s = samples[si];
    let found = false;
    for (let attempt = 0; attempt < k; attempt++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = minDist * (1 + Math.random()); // r..2r in annulus
      const candidate: Vec2 = [
        s[0] + Math.cos(angle) * radius,
        s[1] + Math.sin(angle) * radius,
      ];
      if (inBounds(candidate) && isFarEnough(candidate)) {
        addSample(candidate);
        found = true;
        break;
      }
    }
    if (!found) {
      active[ai] = active[active.length - 1];
      active.pop();
    }
  }

  return samples;
}

/**
 * Creates a natural-looking forest within a rectangular region centered at (x, y).
 * Uses Poisson disk sampling for even-but-random spacing.
 */
export function createForest(
  x: number,
  y: number,
  options: ForestOptions = {}
): THREE.Group {
  const {
    length = 32,
    width = 24,
    minDistance = 2.6,
    attemptsPerPoint = 20,
    edgePadding = minDistance * 0.5,
    trunkHeightRange = [2.0, 3.0],
    canopyRadiusRange = [0.8, 1.3],
    canopyLobesRange = [3, 5],
    castShadow = true,
  } = options;

  const innerLength = Math.max(0.1, length - 2 * edgePadding);
  const innerWidth = Math.max(0.1, width - 2 * edgePadding);

  const points = poissonSampleRect(
    innerLength,
    innerWidth,
    Math.max(0.5, minDistance),
    Math.max(5, Math.floor(attemptsPerPoint))
  );

  const group = new THREE.Group();

  for (const p of points) {
    const trunkH = randomInRange(trunkHeightRange[0], trunkHeightRange[1]);
    const canopyR = randomInRange(canopyRadiusRange[0], canopyRadiusRange[1]);
    const canopyL = randomIntInRange(canopyLobesRange[0], canopyLobesRange[1]);

    const tree = createTree({
      trunkHeight: trunkH,
      canopyRadius: canopyR,
      canopyLobes: canopyL,
      randomize: true,
      castShadow,
    });
    tree.position.set(x + p[0], 0, y + p[1]);
    tree.rotation.y = Math.random() * Math.PI * 2;
    group.add(tree);
  }

  return group;
}
