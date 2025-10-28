import * as THREE from "three";
import { createAsphaltMaterial } from "../materials";
import { createArcMarkings } from "../arc-lines";
import { EDGE_LINE_WIDTH, CENTER_LINE_WIDTH, SLAB_THICKNESS } from "../common";
import { createTileGroup, type TileCreateContext } from "./types";

/**
 * Quarter-turn tile: fits inside a tileSize square. The annulus is centered on the tile,
 * with outer radius at tileSize/2 so it meets the tile's E and S edges (rotation 0).
 */
export function createTurnTile(ctx: TileCreateContext): THREE.Group {
  const { tileSize, style } = ctx;
  const totalWidth = style.totalWidth;

  const group = createTileGroup("road-tile-turn");

  // Geometry: quarter annulus sector (90°) oriented in +X→+Z by default.
  const thetaLength = Math.PI / 2;

  // Outer radius chosen so the slab touches the tile edges at \n    x=±tileSize/2 or z=±tileSize/2. Subtract tiny margin to avoid z-fighting.
  const margin = 0.001;
  const outerRadius = tileSize / 2 - margin;
  const innerRadius = Math.max(0.02, outerRadius - totalWidth);

  // Build slab using RingGeometry and rotate to XZ plane.
  const slabThickness = SLAB_THICKNESS;
  const asphaltGeom = new THREE.RingGeometry(
    innerRadius,
    outerRadius,
    64,
    1,
    Math.PI,
    thetaLength
  );
  asphaltGeom.rotateX(-Math.PI / 2);
  const asphaltMat = createAsphaltMaterial();
  const asphalt = new THREE.Mesh(asphaltGeom, asphaltMat);
  asphalt.position.set(0, slabThickness / 2 + 0.005, 0);
  asphalt.receiveShadow = true;
  group.add(asphalt);

  // Center line: at mid radius between directions (approx using half width offset from inner edge).
  const centerRadius = innerRadius + totalWidth / 2;
  const center = createArcMarkings({
    radius: centerRadius,
    width: CENTER_LINE_WIDTH,
    startAngle: Math.PI,
    angle: thetaLength,
    thickness: 0.01,
    dashed: style.dashedCenter,
    dashLength: 1.6,
    gapLength: 1.0,
    thetaSegments: 48,
  });
  center.position.set(0, slabThickness + 0.005, 0);
  group.add(center);

  // Edge lines: inner and outer
  const outerEdge = createArcMarkings({
    radius: outerRadius - EDGE_LINE_WIDTH * 0.5,
    width: EDGE_LINE_WIDTH,
    startAngle: Math.PI,
    angle: thetaLength,
    thickness: 0.01,
    dashed: false,
    thetaSegments: 48,
  });
  outerEdge.position.set(0, slabThickness + 0.005, 0);
  const innerEdge = createArcMarkings({
    radius: innerRadius + EDGE_LINE_WIDTH * 0.5,
    width: EDGE_LINE_WIDTH,
    startAngle: Math.PI,
    angle: thetaLength,
    thickness: 0.01,
    dashed: false,
    thetaSegments: 48,
  });
  innerEdge.position.set(0, slabThickness + 0.005, 0);
  group.add(outerEdge, innerEdge);

  return group;
}
