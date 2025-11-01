import type {
  Building,
  Depot,
  GasStation,
  Node,
  Road,
  Site,
  Truck,
} from './domain/entities';
import type {
  AgentId,
  BuildingId,
  NodeId,
  PackageId,
  RoadId,
  TruckId,
} from './domain/ids';
import type { SimSnapshot } from './store/snapshot';

export const getNodeById = (s: SimSnapshot, id: NodeId): Node | undefined =>
  s.nodes[id];

export const getRoadById = (s: SimSnapshot, id: RoadId): Road | undefined =>
  s.roads[id];

export const getTruckById = (s: SimSnapshot, id: TruckId): Truck | undefined =>
  s.trucks[id];

export const getBuildingById = (
  s: SimSnapshot,
  id: BuildingId,
): (Building | Depot | GasStation | Site) | undefined => s.buildings[id];

export const getSiteById = (
  s: SimSnapshot,
  id: BuildingId,
): Site | undefined => {
  const b = s.buildings[id];
  return b && b.kind === 'site' ? (b as Site) : undefined;
};

export const getBuildingsAtNode = (
  s: SimSnapshot,
  nodeId: NodeId,
): (Building | Depot | GasStation | Site)[] => {
  const node = s.nodes[nodeId];
  if (!node) return [];
  return node.buildingIds.map((id) => s.buildings[id]).filter(Boolean) as (
    | Building
    | Depot
    | GasStation
    | Site
  )[];
};

export const getSitesAtNode = (s: SimSnapshot, nodeId: NodeId): Site[] => {
  const buildings = getBuildingsAtNode(s, nodeId);
  return buildings.filter((b) => b.kind === 'site') as Site[];
};

export const getPackagesAtSite = (
  s: SimSnapshot,
  siteId: BuildingId,
): PackageId[] => {
  const site = getSiteById(s, siteId);
  return site ? site.packageIds : [];
};

export const getOutgoingEdges = (s: SimSnapshot, nodeId: NodeId) =>
  Object.values(s.edges).filter((e) => e.startNodeId === nodeId);

export const getIncomingEdges = (s: SimSnapshot, nodeId: NodeId) =>
  Object.values(s.edges).filter((e) => e.endNodeId === nodeId);
