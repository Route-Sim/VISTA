import type { SimEvent } from '../events';
import type { SimSnapshot } from '../store/snapshot';
import { createEmptySnapshot } from '../store/snapshot';
import type { SignalData } from '@/net';
import type { SignalEnvelopeOf } from '@/net';
import type {
  NodeMap,
  EdgeMap,
  RoadMap,
  BuildingMap,
  Truck,
  Broker,
  Package,
  Parking,
  Site,
  GasStation,
  PackageConfig,
  SiteStatistics,
} from '../domain/entities';
import type { DeliveryUrgency, Priority } from '../domain/enums';
import {
  asEdgeId,
  asNodeId,
  asRoadId,
  asTruckId,
  asBrokerId,
  asBuildingId,
  asPackageId,
  asAgentId,
} from '../domain/ids';

// Wire → Domain mapping stubs. These will be implemented once the @net schema
// is finalized. Keeping the signatures stable allows @net and @sim to evolve
// independently while the view consumes typed events and snapshots.

type MapCreatedData = SignalData['map.created'];

function isSignalEnvelope<K extends keyof SignalData>(
  x: unknown,
  key: K,
): x is SignalEnvelopeOf<K> {
  if (typeof x !== 'object' || x === null) return false;
  const s = x as Record<string, unknown>;
  return s['signal'] === key && typeof s['data'] === 'object';
}

function isMapCreatedData(x: unknown): x is MapCreatedData {
  if (typeof x !== 'object' || x === null) return false;
  const d = x as Record<string, unknown>;
  const graph = d['graph'] as unknown;
  if (typeof graph !== 'object' || graph === null) return false;
  const g = graph as Record<string, unknown>;
  return Array.isArray(g['nodes']) && Array.isArray(g['edges']);
}

export function mapNetEvent(payload: unknown): SimEvent | undefined {
  // --- Map Created ---
  let mapData: MapCreatedData | undefined;
  if (isSignalEnvelope(payload, 'map.created')) {
    mapData = payload.data;
  } else if (isMapCreatedData(payload)) {
    mapData = payload;
  }

  if (mapData) {
    const nodes: NodeMap = {};
    const buildings: BuildingMap = {};

    for (const n of mapData.graph.nodes) {
      const nodeId = asNodeId(n.id);
      const nodeBuildingIds: any[] = []; // temporary to collect IDs

      if (n.buildings) {
        for (const b of n.buildings) {
          const bId = asBuildingId(b.id);
          nodeBuildingIds.push(bId);

          if (b.type === 'parking') {
            const p = b as any;
            const parking: Parking = {
              id: bId,
              nodeId,
              kind: 'parking',
              capacity: p.capacity || 0,
              truckIds: [],
            };
            buildings[bId] = parking;
          } else if (b.type === 'site') {
            // Site
            const s = b as any;
            const site: Site = {
              id: bId,
              nodeId,
              kind: 'site',
              name: (s.name as string) || undefined,
              activityRate: (s.activity_rate as number) || 0,
              packageIds: (s.active_packages || []).map((pid: string) =>
                asPackageId(pid),
              ),
              truckIds: [],
            };
            buildings[bId] = site;
          } else if (b.type === 'gas_station') {
            // Gas Station
            const gs = b as any;
            const gasStation: GasStation = {
              id: bId,
              nodeId,
              kind: 'gas_station',
              capacity: gs.capacity || 0,
              costFactor: gs.cost_factor || 1.0,
              truckIds: [],
            };
            buildings[bId] = gasStation;
          }
        }
      }

      nodes[nodeId] = {
        id: nodeId,
        x: n.x,
        y: n.y,
        buildingIds: nodeBuildingIds,
      };
    }

    const edges: EdgeMap = {};
    const roads: RoadMap = {};
    for (const e of mapData.graph.edges) {
      const edgeId = asEdgeId(e.id);
      const start = asNodeId(e.from_node);
      const end = asNodeId(e.to_node);
      edges[edgeId] = {
        id: edgeId,
        startNodeId: start,
        endNodeId: end,
        lengthM: e.length_m,
      };
      const roadId = asRoadId(e.id);
      roads[roadId] = {
        id: roadId,
        startNodeId: start,
        endNodeId: end,
        lengthM: e.length_m,
        roadClass: e.road_class,
        mode: e.mode,
        lanes: e.lanes,
        maxSpeedKph: e.max_speed_kph,
        weightLimitKg: e.weight_limit_kg,
        truckIds: [],
      };
    }
    return {
      type: 'map.created',
      nodes,
      edges,
      roads,
      buildings,
    };
  }

  // --- Agent Created ---
  if (isSignalEnvelope(payload, 'agent.created')) {
    const data = payload.data;
    const tags = data.tags || {};

    if (data.kind === 'truck') {
      const truck: Truck = {
        id: asTruckId(data.id),
        capacity: (tags.capacity as number) || 0,
        maxSpeed: data.max_speed_kph,
        currentSpeed: data.current_speed_kph,
        packageIds: [],
        maxFuel: (tags.fuel_tank_capacity_l as number) || 100,
        currentFuel: (tags.current_fuel_l as number) || 100,
        co2Emission: (tags.co2_emitted_kg as number) || 0,
        inboxCount: data.inbox_count || 0,
        outboxCount: data.outbox_count || 0,
        currentNodeId:
          data.current_node !== null
            ? asNodeId(String(data.current_node))
            : null,
        currentEdgeId:
          data.current_edge !== null
            ? asRoadId(String(data.current_edge))
            : null,
        currentBuildingId:
          data.current_building_id !== null
            ? asBuildingId(String(data.current_building_id))
            : null,
        edgeProgress: data.edge_progress_m || 0,
        route: (data.route || []).map((id: string | number) =>
          asNodeId(String(id)),
        ),
        destinationNodeId:
          data.destination !== null ? asNodeId(String(data.destination)) : null,
        routeStartNodeId:
          data.route_start_node !== null
            ? asNodeId(String(data.route_start_node))
            : null,
        routeEndNodeId:
          data.route_end_node !== null
            ? asNodeId(String(data.route_end_node))
            : null,
        // New fields with defaults
        drivingTimeS: (tags.driving_time_s as number) || 0,
        restingTimeS: (tags.resting_time_s as number) || 0,
        isResting: (tags.is_resting as boolean) || false,
        balanceDucats: (tags.balance_ducats as number) || 0,
        riskFactor: (tags.risk_factor as number) || 0.5,
        isSeekingParking: (tags.is_seeking_parking as boolean) || false,
        originalDestination: null,
        isSeekingGasStation: (tags.is_seeking_gas_station as boolean) || false,
        isFueling: (tags.is_fueling as boolean) || false,
      };
      return { type: 'truck.created', truck };
    } else if (data.kind === 'broker') {
      const broker: Broker = {
        id: asBrokerId(data.id),
        balanceDucats: data.balance_ducats || 0,
        queueSize: (tags.queue_size as number) || 0,
        assignedCount: (tags.assigned_count as number) || 0,
        hasActiveNegotiation: (tags.has_active_negotiation as boolean) || false,
      };
      return { type: 'broker.created', broker };
    } else if (data.kind === 'building') {
      const id = asBuildingId(data.id);
      const bData = (data as any).building || {};
      const nodeId = asNodeId(
        (bData.node_id as string) || (tags.nodeId as string) || '0',
      );

      if (tags.type === 'parking') {
        const parking: Parking = {
          id,
          nodeId,
          kind: 'parking',
          capacity: (tags.capacity as number) || 0,
          truckIds: [],
        };
        return { type: 'building.created', building: parking };
      } else if (tags.type === 'gas_station') {
        const gasStation: GasStation = {
          id,
          nodeId,
          kind: 'gas_station',
          capacity: (tags.capacity as number) || 0,
          costFactor: (tags.cost_factor as number) || 1.0,
          truckIds: [],
        };
        return { type: 'building.created', building: gasStation };
      } else {
        // Default to site
        const site: Site = {
          id,
          nodeId,
          kind: 'site',
          packageIds: [],
          truckIds: [],
        };
        return { type: 'building.created', building: site };
      }
    }

    // Generic Agent fallback
    return {
      type: 'agent.created',
      agent: { id: asAgentId((data as any).id) },
    };
  }

  // --- Agent Updated ---
  if (isSignalEnvelope(payload, 'agent.updated')) {
    const data = payload.data;

    // Handle truck agent updates
    if (data.kind === 'truck') {
      const patch: Partial<Truck> = {
        currentSpeed: data.current_speed_kph,
        maxSpeed: data.max_speed_kph,
        capacity: data.capacity,
        packageIds: (data.loaded_packages || []).map((id: string) =>
          asPackageId(id),
        ),
        currentNodeId:
          data.current_node !== null
            ? asNodeId(String(data.current_node))
            : null,
        currentEdgeId:
          data.current_edge !== null
            ? asRoadId(String(data.current_edge))
            : null,
        currentBuildingId:
          data.current_building_id !== null
            ? asBuildingId(String(data.current_building_id))
            : null,
        route: (data.route || []).map((id: string | number) =>
          asNodeId(String(id)),
        ),
        routeStartNodeId:
          data.route_start_node !== null
            ? asNodeId(String(data.route_start_node))
            : null,
        routeEndNodeId:
          data.route_end_node !== null
            ? asNodeId(String(data.route_end_node))
            : null,
        drivingTimeS: data.driving_time_s,
        restingTimeS: data.resting_time_s,
        isResting: data.is_resting,
        balanceDucats: data.balance_ducats,
        riskFactor: data.risk_factor,
        isSeekingParking: data.is_seeking_parking,
        originalDestination:
          data.original_destination !== null
            ? asNodeId(String(data.original_destination))
            : null,
        maxFuel: data.fuel_tank_capacity_l,
        currentFuel: data.current_fuel_l,
        co2Emission: data.co2_emitted_kg,
        isSeekingGasStation: data.is_seeking_gas_station,
        isFueling: data.is_fueling,
      };

      return {
        type: 'truck.updated',
        id: asAgentId(data.agent_id),
        patch,
      };
    }

    // Handle broker agent updates
    if (data.kind === 'broker') {
      const patch: Partial<Broker> = {
        balanceDucats: data.balance_ducats,
        queueSize: data.queue_size,
        assignedCount: data.assigned_count,
        hasActiveNegotiation: data.has_active_negotiation,
      };

      return {
        type: 'broker.updated',
        id: asBrokerId(data.agent_id),
        patch,
      };
    }

    // Fallback for unknown agent types
    const anyData = data as Record<string, unknown>;
    const patch: Record<string, unknown> = { ...anyData };
    return {
      type: 'agent.updated',
      id: asAgentId(anyData.agent_id as string),
      patch,
    };
  }

  // --- Building Updated ---
  if (isSignalEnvelope(payload, 'building.updated')) {
    const data = payload.data;
    const building = data.building;
    const buildingId = asBuildingId(data.building_id);

    if (building.type === 'site') {
      const b = building as any;
      const packageConfig: PackageConfig | undefined = b.package_config
        ? {
            sizeRange: b.package_config.size_range,
            valueRangeCurrency: b.package_config.value_range_currency,
            pickupDeadlineRangeTicks:
              b.package_config.pickup_deadline_range_ticks,
            deliveryDeadlineRangeTicks:
              b.package_config.delivery_deadline_range_ticks,
            priorityWeights: b.package_config.priority_weights,
            urgencyWeights: b.package_config.urgency_weights,
          }
        : undefined;

      const statistics: SiteStatistics | undefined = b.statistics
        ? {
            packagesGenerated: b.statistics.packages_generated,
            packagesPickedUp: b.statistics.packages_picked_up,
            packagesDelivered: b.statistics.packages_delivered,
            packagesExpired: b.statistics.packages_expired,
            totalValueDelivered: b.statistics.total_value_delivered,
            totalValueExpired: b.statistics.total_value_expired,
          }
        : undefined;

      const patch: Partial<Site> = {
        name: b.name,
        capacity: b.capacity,
        activityRate: b.activity_rate,
        loadingRateTonnesPerMin: b.loading_rate_tonnes_per_min,
        destinationWeights: b.destination_weights,
        packageConfig,
        packageIds: (b.active_packages || []).map((id: string) =>
          asPackageId(id),
        ),
        statistics,
        truckIds: (b.current_agents || []).map((id: string) => asTruckId(id)),
      };

      return {
        type: 'building.updated',
        id: buildingId,
        patch,
      };
    }

    if (building.type === 'parking') {
      const b = building as any;
      const patch: Partial<Parking> = {
        capacity: b.capacity,
        truckIds: (b.current_agents || []).map((id: string) => asTruckId(id)),
      };

      return {
        type: 'building.updated',
        id: buildingId,
        patch,
      };
    }

    if (building.type === 'gas_station') {
      const b = building as any;
      const patch: Partial<GasStation> = {
        capacity: b.capacity,
        costFactor: b.cost_factor,
        truckIds: (b.current_agents || []).map((id: string) => asTruckId(id)),
      };

      return {
        type: 'building.updated',
        id: buildingId,
        patch,
      };
    }
  }

  // --- Package Created ---
  if (isSignalEnvelope(payload, 'package.created')) {
    const data = payload.data;

    // Parse priority from wire format (e.g., "Priority.LOW" -> "LOW")
    const parsePriority = (p: string): Priority => {
      const match = p.match(/Priority\.(\w+)/);
      return (match ? match[1] : p) as Priority;
    };

    // Parse urgency from wire format (e.g., "DeliveryUrgency.STANDARD" -> "STANDARD")
    const parseUrgency = (u: string): DeliveryUrgency => {
      const match = u.match(/DeliveryUrgency\.(\w+)/);
      return (match ? match[1] : u) as DeliveryUrgency;
    };

    const pkg: Package = {
      id: asPackageId(data.package_id),
      originBuildingId: asBuildingId(data.origin_building_id),
      destinationBuildingId: asBuildingId(data.destination_building_id),
      size: data.size,
      valueCurrency: data.value_currency,
      priority: parsePriority(data.priority),
      urgency: parseUrgency(data.urgency),
      pickupDeadlineTick: data.pickup_deadline_tick,
      deliveryDeadlineTick: data.delivery_deadline_tick,
      createdAtTick: data.created_at_tick,
    };

    return {
      type: 'package.created',
      pkg,
    };
  }

  // --- Agent Deleted ---
  if (isSignalEnvelope(payload, 'agent.deleted')) {
    return {
      type: 'agent.deleted',
      id: asAgentId(payload.data.agent_id),
    };
  }

  // --- Simulation Config ---
  if (
    isSignalEnvelope(payload, 'simulation.started') ||
    isSignalEnvelope(payload, 'simulation.updated')
  ) {
    const data = payload.data;
    return {
      type: 'simulation.config',
      config: {
        speed: data.speed,
        tickRate: data.tick_rate,
      },
    };
  }

  return undefined;
}

export function mapNetSnapshot(_payload: unknown): SimSnapshot {
  // TODO: Implement according to @net protocol
  return createEmptySnapshot();
}

export function mapNetDelta(_payload: unknown): SimEvent[] {
  // TODO: Implement according to @net protocol
  return [];
}
