import type { Node, SimSnapshot } from '@/sim';

export interface GraphTransform {
  centerX: number;
  centerY: number;
  scale: number;
}

export const GRAPH_POSITION_SCALE = 0.1;

export function computeGraphTransform(snapshot: SimSnapshot): GraphTransform {
  const nodes = Object.values(snapshot.nodes) as Node[];
  if (nodes.length === 0) {
    return { centerX: 0, centerY: 0, scale: GRAPH_POSITION_SCALE };
  }

  let minX = nodes[0].x;
  let maxX = nodes[0].x;
  let minY = nodes[0].y;
  let maxY = nodes[0].y;

  for (let index = 1; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (node.x < minX) minX = node.x;
    if (node.x > maxX) maxX = node.x;
    if (node.y < minY) minY = node.y;
    if (node.y > maxY) maxY = node.y;
  }

  const centerX = (minX + maxX) * 0.5;
  const centerY = (minY + maxY) * 0.5;

  return {
    centerX,
    centerY,
    scale: GRAPH_POSITION_SCALE,
  };
}

export function normalizePoint(
  x: number,
  y: number,
  transform: GraphTransform,
): { x: number; y: number } {
  return {
    x: (x - transform.centerX) * transform.scale,
    y: (y - transform.centerY) * transform.scale,
  };
}
