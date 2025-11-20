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
  Parking,
  Site,
} from '../domain/entities';
import {
  asEdgeId,
  asNodeId,
  asRoadId,
  asTruckId,
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

          // Parking has type='parking'; Site has no type (or 'site' implicit)
          // schema.ts defines ParkingData with type: 'parking'
          if ((b as any).type === 'parking') {
            const p = b as any;
            const parking: Parking = {
              id: bId,
              nodeId,
              kind: 'parking',
              capacity: p.capacity || 0,
              truckIds: [],
            };
            buildings[bId] = parking;
          } else {
            // Site
            const s = b as any;
            const site: Site = {
              id: bId,
              nodeId,
              kind: 'site',
              packageIds: (s.active_packages || []).map((pid: string) =>
                asPackageId(pid),
              ),
              truckIds: [],
            };
            buildings[bId] = site;
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
        maxFuel: (tags.maxFuel as number) || 100,
        currentFuel: (tags.currentFuel as number) || 100,
        co2Emission: (tags.co2Emission as number) || 0,
      };
      return { type: 'truck.created', truck };
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
    return {
      type: 'agent.updated',
      id: asAgentId(payload.data.agent_id),
      patch: payload.data, // pass full data as patch
    };
  }

  // --- Agent Deleted ---
  if (isSignalEnvelope(payload, 'agent.deleted')) {
    return {
      type: 'agent.deleted',
      id: asAgentId(payload.data.agent_id),
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
