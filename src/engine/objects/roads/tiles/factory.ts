import * as THREE from "three";
import {
  type TileCreateContext,
  type TileSpec,
  type Rotation,
  normalizeRotation,
} from "./types";
import { createStraightTile } from "./straight-tile";
import { createTurnTile } from "./turn-tile";

type Creator = (ctx: TileCreateContext) => THREE.Group;

const registry: Record<string, Creator> = {
  straight: createStraightTile,
  turn: createTurnTile,
};

export function createTile(
  spec: TileSpec,
  ctx: TileCreateContext
): THREE.Group {
  if (spec.kind === "empty") return new THREE.Group();
  const creator = registry[spec.kind];
  if (!creator) return new THREE.Group();
  const g = creator(ctx);
  // Rotate around center by rotation
  const rot: Rotation = normalizeRotation(spec.rotation);
  g.rotation.y = (rot * Math.PI) / 180;
  return g;
}
