import type {
  AgentMap,
  BrokerMap,
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
  brokers: BrokerMap;
  packages: PackageMap;
  agents: AgentMap;
  config: {
    speed: number;
    tickRate: number;
  };
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
    brokers: {},
    packages: {},
    agents: {},
    config: {
      speed: 1,
      tickRate: 1,
    },
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
    brokers: { ...s.brokers },
    packages: { ...s.packages },
    agents: { ...s.agents },
    config: { ...s.config },
  };
}

export function isSimSnapshot(x: unknown): x is SimSnapshot {
  if (typeof x !== 'object' || x === null) return false;
  const s = x as Record<string, unknown>;
  return (
    s.version === 1 &&
    typeof s.tick === 'number' &&
    typeof s.timeMs === 'number' &&
    typeof s.nodes === 'object' &&
    typeof s.edges === 'object' &&
    typeof s.roads === 'object' &&
    typeof s.buildings === 'object' &&
    typeof s.trucks === 'object' &&
    typeof s.brokers === 'object' &&
    typeof s.packages === 'object' &&
    typeof s.agents === 'object' &&
    typeof s.config === 'object'
  );
}

export function freezeSnapshot(s: SimSnapshot): SimSnapshot {
  Object.freeze(s.nodes);
  Object.freeze(s.edges);
  Object.freeze(s.roads);
  Object.freeze(s.buildings);
  Object.freeze(s.trucks);
  Object.freeze(s.brokers);
  Object.freeze(s.packages);
  Object.freeze(s.agents);
  Object.freeze(s.config);
  return Object.freeze(s) as SimSnapshot;
}
