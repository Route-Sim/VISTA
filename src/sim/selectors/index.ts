import {
  Building,
  type BuildingId,
  Depot,
  type DepotId,
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
import { type SimulationSnapshot } from '@/sim/state';

export const selectNode = (
  snapshot: SimulationSnapshot,
  nodeId: NodeId,
): Node | undefined => snapshot.nodes.get(nodeId);

export const selectRoad = (
  snapshot: SimulationSnapshot,
  roadId: RoadId,
): Road | undefined => snapshot.roads.get(roadId);

export const selectBuilding = (
  snapshot: SimulationSnapshot,
  buildingId: BuildingId,
): Building | undefined => snapshot.buildings.get(buildingId);

export const selectDepot = (
  snapshot: SimulationSnapshot,
  depotId: DepotId,
): Depot | undefined => snapshot.depots.get(depotId);

export const selectSite = (
  snapshot: SimulationSnapshot,
  siteId: SiteId,
): Site | undefined => snapshot.sites.get(siteId);

export const selectTruck = (
  snapshot: SimulationSnapshot,
  truckId: TruckId,
): Truck | undefined => snapshot.trucks.get(truckId);

export const selectPackage = (
  snapshot: SimulationSnapshot,
  packageId: PackageId,
): Package | undefined => snapshot.packages.get(packageId);

export const listTrucksByBuilding = (
  snapshot: SimulationSnapshot,
  buildingId: BuildingId,
): Truck[] => {
  const building = selectBuilding(snapshot, buildingId);
  if (!building) {
    return [];
  }

  return building
    .listTruckIds()
    .map((id) => selectTruck(snapshot, id))
    .filter((truck): truck is Truck => Boolean(truck));
};

export const listPackagesBySite = (
  snapshot: SimulationSnapshot,
  siteId: SiteId,
): Package[] => {
  const site = selectSite(snapshot, siteId);
  if (!site) {
    return [];
  }

  return site
    .listPackageIds()
    .map((id) => selectPackage(snapshot, id))
    .filter((pkg): pkg is Package => Boolean(pkg));
};

export const listPackagesOnTruck = (
  snapshot: SimulationSnapshot,
  truckId: TruckId,
): Package[] => {
  const truck = selectTruck(snapshot, truckId);
  if (!truck) {
    return [];
  }

  return truck
    .listPackageIds()
    .map((id) => selectPackage(snapshot, id))
    .filter((pkg): pkg is Package => Boolean(pkg));
};
