export const EDGE_LINE_WIDTH = 0.12;
export const CENTER_LINE_WIDTH = 0.15;
export const SLAB_THICKNESS = 0.04;

export type RoadDimensionInput = {
  width?: number;
  lanesPerDirection?: number;
  laneWidth?: number;
  shoulderWidth?: number;
};

export type RoadDimensions = {
  totalLanes: number;
  carriageWidth: number;
  totalWidth: number;
  halfWidth: number;
};

export function computeRoadDimensions(
  input: RoadDimensionInput = {}
): RoadDimensions {
  const {
    width,
    lanesPerDirection = 1,
    laneWidth = 3.2,
    shoulderWidth = 0.6,
  } = input;
  const totalLanes = Math.max(1, lanesPerDirection) * 2;
  const carriageWidth = totalLanes * Math.max(2.4, laneWidth);
  const totalWidth = width ?? carriageWidth + shoulderWidth * 2;
  return {
    totalLanes,
    carriageWidth,
    totalWidth,
    halfWidth: totalWidth / 2,
  };
}
