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
import {
  type SimulationCollections,
  type SimulationSnapshot,
  createEmptyCollections,
} from '@/sim/state';

export class SimulationState {
  private readonly collections: SimulationCollections;

  private constructor(collections: SimulationCollections) {
    this.collections = collections;
  }

  public static empty(): SimulationState {
    return new SimulationState(createEmptyCollections());
  }

  public static fromCollections(
    collections: SimulationCollections,
  ): SimulationState {
    return new SimulationState(collections);
  }

  public snapshot(): SimulationSnapshot {
    return {
      nodes: this.cloneMap(this.collections.nodes),
      edges: this.cloneMap(this.collections.edges),
      roads: this.cloneMap(this.collections.roads),
      buildings: this.cloneMap(this.collections.buildings),
      depots: this.cloneMap(this.collections.depots),
      gasStations: this.cloneMap(this.collections.gasStations),
      sites: this.cloneMap(this.collections.sites),
      packages: this.cloneMap(this.collections.packages),
      trucks: this.cloneMap(this.collections.trucks),
      agents: this.cloneMap(this.collections.agents),
    };
  }

  public withNode(node: Node): SimulationState {
    return this.clone({
      nodes: this.set(this.collections.nodes, node.id, node),
    });
  }

  public withoutNode(nodeId: NodeId): SimulationState {
    return this.clone({ nodes: this.delete(this.collections.nodes, nodeId) });
  }

  public withEdge(edge: Edge): SimulationState {
    return this.clone({
      edges: this.set(this.collections.edges, edge.id, edge),
    });
  }

  public withoutEdge(edgeId: EdgeId): SimulationState {
    return this.clone({ edges: this.delete(this.collections.edges, edgeId) });
  }

  public withRoad(road: Road): SimulationState {
    return this.clone({
      roads: this.set(this.collections.roads, road.id, road),
    });
  }

  public withoutRoad(roadId: RoadId): SimulationState {
    return this.clone({ roads: this.delete(this.collections.roads, roadId) });
  }

  public withBuilding(building: Building): SimulationState {
    return this.clone({
      buildings: this.set(this.collections.buildings, building.id, building),
    });
  }

  public withoutBuilding(buildingId: BuildingId): SimulationState {
    return this.clone({
      buildings: this.delete(this.collections.buildings, buildingId),
    });
  }

  public withDepot(depot: Depot): SimulationState {
    return this.clone({
      depots: this.set(this.collections.depots, depot.id, depot),
    });
  }

  public withoutDepot(depotId: DepotId): SimulationState {
    return this.clone({
      depots: this.delete(this.collections.depots, depotId),
    });
  }

  public withGasStation(gasStation: GasStation): SimulationState {
    return this.clone({
      gasStations: this.set(
        this.collections.gasStations,
        gasStation.id,
        gasStation,
      ),
    });
  }

  public withoutGasStation(gasStationId: GasStationId): SimulationState {
    return this.clone({
      gasStations: this.delete(this.collections.gasStations, gasStationId),
    });
  }

  public withSite(site: Site): SimulationState {
    return this.clone({
      sites: this.set(this.collections.sites, site.id, site),
    });
  }

  public withoutSite(siteId: SiteId): SimulationState {
    return this.clone({ sites: this.delete(this.collections.sites, siteId) });
  }

  public withPackage(pkg: Package): SimulationState {
    return this.clone({
      packages: this.set(this.collections.packages, pkg.id, pkg),
    });
  }

  public withoutPackage(packageId: PackageId): SimulationState {
    return this.clone({
      packages: this.delete(this.collections.packages, packageId),
    });
  }

  public withTruck(truck: Truck): SimulationState {
    return this.clone({
      trucks: this.set(this.collections.trucks, truck.id, truck),
    });
  }

  public withoutTruck(truckId: TruckId): SimulationState {
    return this.clone({
      trucks: this.delete(this.collections.trucks, truckId),
    });
  }

  public withAgent(agent: Agent): SimulationState {
    return this.clone({
      agents: this.set(this.collections.agents, agent.id, agent),
    });
  }

  public withoutAgent(agentId: AgentId): SimulationState {
    return this.clone({
      agents: this.delete(this.collections.agents, agentId),
    });
  }

  private clone(overrides: Partial<SimulationCollections>): SimulationState {
    return new SimulationState({
      nodes: overrides.nodes ?? this.collections.nodes,
      edges: overrides.edges ?? this.collections.edges,
      roads: overrides.roads ?? this.collections.roads,
      buildings: overrides.buildings ?? this.collections.buildings,
      depots: overrides.depots ?? this.collections.depots,
      gasStations: overrides.gasStations ?? this.collections.gasStations,
      sites: overrides.sites ?? this.collections.sites,
      packages: overrides.packages ?? this.collections.packages,
      trucks: overrides.trucks ?? this.collections.trucks,
      agents: overrides.agents ?? this.collections.agents,
    });
  }

  private set<K, V>(map: Map<K, V>, key: K, value: V): Map<K, V> {
    const next = new Map(map);
    next.set(key, value);
    return next;
  }

  private delete<K, V>(map: Map<K, V>, key: K): Map<K, V> {
    if (!map.has(key)) {
      return map;
    }

    const next = new Map(map);
    next.delete(key);
    return next;
  }

  private cloneMap<K, V>(map: Map<K, V>): ReadonlyMap<K, V> {
    return new Map(map);
  }
}
