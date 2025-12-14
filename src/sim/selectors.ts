import type {
  Broker,
  GasStation,
  Node,
  Package,
  Parking,
  Road,
  SimulationTime,
  Site,
  Truck,
} from './domain/entities';
import type {
  BrokerId,
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

export const getBrokerById = (
  s: SimSnapshot,
  id: BrokerId,
): Broker | undefined => s.brokers[id];

export const getPackageById = (
  s: SimSnapshot,
  id: PackageId,
): Package | undefined => s.packages[id];

export const getBuildingById = (
  s: SimSnapshot,
  id: BuildingId,
): (Parking | Site | GasStation) | undefined => s.buildings[id];

export const getSiteById = (
  s: SimSnapshot,
  id: BuildingId,
): Site | undefined => {
  const b = s.buildings[id];
  return b && b.kind === 'site' ? (b as Site) : undefined;
};

export const getParkingById = (
  s: SimSnapshot,
  id: BuildingId,
): Parking | undefined => {
  const b = s.buildings[id];
  return b && b.kind === 'parking' ? (b as Parking) : undefined;
};

export const getGasStationById = (
  s: SimSnapshot,
  id: BuildingId,
): GasStation | undefined => {
  const b = s.buildings[id];
  return b && b.kind === 'gas_station' ? (b as GasStation) : undefined;
};

export const getBuildingsAtNode = (
  s: SimSnapshot,
  nodeId: NodeId,
): (Parking | Site | GasStation)[] => {
  const node = s.nodes[nodeId];
  if (!node) return [];
  return node.buildingIds.map((id) => s.buildings[id]).filter(Boolean) as (
    | Parking
    | Site
    | GasStation
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

export const getPackageEntitiesAtSite = (
  s: SimSnapshot,
  siteId: BuildingId,
): Package[] => {
  const packageIds = getPackagesAtSite(s, siteId);
  return packageIds
    .map((id) => s.packages[id])
    .filter(Boolean) as Package[];
};

export const getAllTrucks = (s: SimSnapshot): Truck[] =>
  Object.values(s.trucks);

export const getAllBrokers = (s: SimSnapshot): Broker[] =>
  Object.values(s.brokers);

export const getAllPackages = (s: SimSnapshot): Package[] =>
  Object.values(s.packages);

export const getAllSites = (s: SimSnapshot): Site[] =>
  Object.values(s.buildings).filter((b) => b.kind === 'site') as Site[];

export const getAllParkings = (s: SimSnapshot): Parking[] =>
  Object.values(s.buildings).filter((b) => b.kind === 'parking') as Parking[];

export const getAllGasStations = (s: SimSnapshot): GasStation[] =>
  Object.values(s.buildings).filter(
    (b) => b.kind === 'gas_station',
  ) as GasStation[];

export const getAllBuildings = (
  s: SimSnapshot,
): (Parking | Site | GasStation)[] => Object.values(s.buildings);

export const getOutgoingEdges = (s: SimSnapshot, nodeId: NodeId) =>
  Object.values(s.edges).filter((e) => e.startNodeId === nodeId);

export const getIncomingEdges = (s: SimSnapshot, nodeId: NodeId) =>
  Object.values(s.edges).filter((e) => e.endNodeId === nodeId);

// Simulation time selectors

export const getSimulationTime = (s: SimSnapshot): SimulationTime =>
  s.simulationTime;

export const getSimulationDay = (s: SimSnapshot): number =>
  s.simulationTime.day;

export const getSimulationTimeOfDay = (s: SimSnapshot): number =>
  s.simulationTime.time;

/**
 * Formats simulation time as HH:MM string (e.g., "12:30", "22:45").
 */
export const formatSimulationTime = (time: number): string => {
  const hours = Math.floor(time);
  const minutes = Math.round((time - hours) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * Returns formatted time string from snapshot (e.g., "12:30").
 */
export const getFormattedSimulationTime = (s: SimSnapshot): string =>
  formatSimulationTime(s.simulationTime.time);
