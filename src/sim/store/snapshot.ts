import type {
  AgentMap,
  BuildingMap,
  EdgeMap,
  NodeMap,
  PackageMap,
  RoadMap,
  TruckMap,
} from '../domain/entities';

export interface SimSnapshot {
  version: 1;
  tick: number;
  timeMs: number;
  nodes: NodeMap;
  edges: EdgeMap;
  roads: RoadMap;
  buildings: BuildingMap;
  trucks: TruckMap;
  packages: PackageMap;
  agents: AgentMap;
}

export type SimDraft = SimSnapshot; // mutable working copy type alias

export function createEmptySnapshot(): SimSnapshot {
  return {
    version: 1,
    tick: 0,
    timeMs: 0,
    nodes: {},
    edges: {},
    roads: {},
    buildings: {},
    trucks: {},
    packages: {},
    agents: {},
  };
}

// Shallow clone at the top level; entity objects are treated as immutable and are
// always replaced, not mutated, by reducers.
export function cloneSnapshot(s: SimSnapshot): SimDraft {
  return {
    version: s.version,
    tick: s.tick,
    timeMs: s.timeMs,
    nodes: { ...s.nodes },
    edges: { ...s.edges },
    roads: { ...s.roads },
    buildings: { ...s.buildings },
    trucks: { ...s.trucks },
    packages: { ...s.packages },
    agents: { ...s.agents },
  };
}

export function isSimSnapshot(x: unknown): x is SimSnapshot {
  if (typeof x !== 'object' || x === null) return false;
  const s = x as Record<string, unknown>;
  return (
    (s.version === 1 || s.version === 1) &&
    typeof s.tick === 'number' &&
    typeof s.timeMs === 'number' &&
    typeof s.nodes === 'object' &&
    typeof s.edges === 'object' &&
    typeof s.roads === 'object' &&
    typeof s.buildings === 'object' &&
    typeof s.trucks === 'object' &&
    typeof s.packages === 'object' &&
    typeof s.agents === 'object'
  );
}

export function freezeSnapshot(s: SimSnapshot): SimSnapshot {
  Object.freeze(s.nodes);
  Object.freeze(s.edges);
  Object.freeze(s.roads);
  Object.freeze(s.buildings);
  Object.freeze(s.trucks);
  Object.freeze(s.packages);
  Object.freeze(s.agents);
  return Object.freeze(s) as SimSnapshot;
}
