import {
  Agent,
  type AgentId,
  Building,
  type BuildingId,
  Depot,
  type DepotId,
  Edge,
  type EdgeId,
  GasStation,
  type GasStationId,
  Node,
  type NodeId,
  Package,
  type PackageId,
  Road,
  type RoadId,
  Site,
  type SiteId,
  Truck,
  type TruckId,
} from '@/sim/domain';

export interface SimulationCollections {
  nodes: Map<NodeId, Node>;
  edges: Map<EdgeId, Edge>;
  roads: Map<RoadId, Road>;
  buildings: Map<BuildingId, Building>;
  depots: Map<DepotId, Depot>;
  gasStations: Map<GasStationId, GasStation>;
  sites: Map<SiteId, Site>;
  packages: Map<PackageId, Package>;
  trucks: Map<TruckId, Truck>;
  agents: Map<AgentId, Agent>;
}

type MapKey<T> = T extends Map<infer K, unknown> ? K : never;
type MapValue<T> = T extends Map<unknown, infer V> ? V : never;

export type SimulationSnapshot = {
  readonly [K in keyof SimulationCollections]: ReadonlyMap<
    MapKey<SimulationCollections[K]>,
    MapValue<SimulationCollections[K]>
  >;
};

export const createEmptyCollections = (): SimulationCollections => ({
  nodes: new Map(),
  edges: new Map(),
  roads: new Map(),
  buildings: new Map(),
  depots: new Map(),
  gasStations: new Map(),
  sites: new Map(),
  packages: new Map(),
  trucks: new Map(),
  agents: new Map(),
});
