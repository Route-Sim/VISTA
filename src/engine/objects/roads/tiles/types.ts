import * as THREE from "three";

export type Rotation = 0 | 90 | 180 | 270;

export type TileKind = "empty" | "straight" | "turn";

export type TileSpec = {
  kind: TileKind;
  rotation: Rotation;
};

export const TILE_CONNECTORS_BASE: Record<TileKind, number> = {
  empty: 0,
  // NESW bits in low nibble: straight connects E and W by default orientation
  straight: 0b0010 | 0b1000,
  // turn connects E and S in default orientation (0°)
  turn: 0b0010 | 0b0100,
};

export type GridSize = {
  width: number; // tiles in X (columns)
  height: number; // tiles in Z (rows)
};

export type RoadStyleInput = {
  lanesPerDirection?: number;
  laneWidth?: number;
  shoulderWidth?: number;
  dashedCenter?: boolean;
};

export type RoadStyle = Required<RoadStyleInput> & {
  totalWidth: number; // computed carriageway + shoulders
  carriageWidth: number; // lanes * laneWidth * 2
};

export type TileCreateContext = {
  tileSize: number;
  style: RoadStyle;
};

export const DEFAULT_TILE_SIZE = 10;

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function normalizeRotation(rot: number): Rotation {
  const r = (((Math.round(rot / 90) * 90) % 360) + 360) % 360;
  return (r === 0 || r === 90 || r === 180 || r === 270 ? r : 0) as Rotation;
}

export function createTileGroup(name: string): THREE.Group {
  const g = new THREE.Group();
  g.name = name;
  return g;
}
