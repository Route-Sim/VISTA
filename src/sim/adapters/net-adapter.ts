import type { SimEvent } from '../events';
import type { SimSnapshot } from '../store/snapshot';
import { createEmptySnapshot } from '../store/snapshot';
import type { SignalData } from '@/net';
import type { SignalEnvelopeOf } from '@/net';
import type { NodeMap, EdgeMap, RoadMap } from '../domain/entities';
import {
  asEdgeId,
  asNodeId,
  asRoadId,
} from '../domain/ids';

// Wire → Domain mapping stubs. These will be implemented once the @net schema
// is finalized. Keeping the signatures stable allows @net and @sim to evolve
// independently while the view consumes typed events and snapshots.

type MapCreatedData = SignalData['map.created'];

function isMapCreatedEnvelope(
  x: unknown,
): x is SignalEnvelopeOf<'map.created'> {
  if (typeof x !== 'object' || x === null) return false;
  const s = x as Record<string, unknown>;
  return s['signal'] === 'map.created' && typeof s['data'] === 'object';
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
  let data: MapCreatedData | undefined;
  if (isMapCreatedEnvelope(payload)) {
    data = payload.data;
  } else if (isMapCreatedData(payload)) {
    data = payload;
  }
  if (!data) return undefined;
  const nodes: NodeMap = {};
  for (const n of data.graph.nodes) {
    nodes[asNodeId(n.id)] = {
      id: asNodeId(n.id),
      x: n.x,
      y: n.y,
      buildingIds: [],
    };
  }
  const edges: EdgeMap = {};
  const roads: RoadMap = {};
  for (const e of data.graph.edges) {
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
  const evt: SimEvent = {
    type: 'map.created',
    nodes,
    edges,
    roads,
  };
  return evt;
}

export function mapNetSnapshot(_payload: unknown): SimSnapshot {
  // TODO: Implement according to @net protocol
  return createEmptySnapshot();
}

export function mapNetDelta(_payload: unknown): SimEvent[] {
  // TODO: Implement according to @net protocol
  return [];
}
