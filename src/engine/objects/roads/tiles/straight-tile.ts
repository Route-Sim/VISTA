import * as THREE from "three";
import { createAsphaltMaterial } from "../materials";
import { createLineMarkings } from "../lines";
import {
  EDGE_LINE_WIDTH,
  CENTER_LINE_WIDTH,
  SLAB_THICKNESS,
  computeRoadDimensions,
} from "../common";
import { createTileGroup, type TileCreateContext } from "./types";

export function createStraightTile(ctx: TileCreateContext): THREE.Group {
  const { tileSize, style } = ctx;
  const dims = computeRoadDimensions({
    width: style.totalWidth,
    lanesPerDirection: style.lanesPerDirection,
    laneWidth: style.laneWidth,
    shoulderWidth: style.shoulderWidth,
  });
  const totalWidth = dims.totalWidth;

  const group = createTileGroup("road-tile-straight");

  // Asphalt slab: tile-wide length along X, road width across Z
  const slabThickness = SLAB_THICKNESS;
  const asphaltGeom = new THREE.BoxGeometry(
    tileSize,
    slabThickness,
    totalWidth
  );
  const asphaltMat = createAsphaltMaterial();
  const asphalt = new THREE.Mesh(asphaltGeom, asphaltMat);
  asphalt.position.y = slabThickness / 2 + 0.005;
  asphalt.receiveShadow = true;
  group.add(asphalt);

  // Center line (dashed configurable)
  const center = createLineMarkings({
    length: tileSize,
    width: CENTER_LINE_WIDTH,
    thickness: 0.01,
    dashed: style.dashedCenter,
    dashLength: 1.6,
    gapLength: 1.0,
  });
  center.position.set(0, slabThickness + 0.005, 0);
  group.add(center);

  // Side edge lines
  const halfW = totalWidth / 2;
  const leftEdge = createLineMarkings({
    length: tileSize,
    width: EDGE_LINE_WIDTH,
    thickness: 0.01,
    dashed: false,
  });
  leftEdge.position.set(
    0,
    slabThickness + 0.005,
    halfW - EDGE_LINE_WIDTH * 0.5
  );
  const rightEdge = createLineMarkings({
    length: tileSize,
    width: EDGE_LINE_WIDTH,
    thickness: 0.01,
    dashed: false,
  });
  rightEdge.position.set(
    0,
    slabThickness + 0.005,
    -halfW + EDGE_LINE_WIDTH * 0.5
  );
  group.add(leftEdge, rightEdge);

  return group;
}
