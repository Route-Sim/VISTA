import type { AgentId } from './domain/ids';
import type { Agent, Truck, Parking, Site } from './domain/entities';
import type { BuildingMap, EdgeMap, NodeMap, RoadMap } from './domain/entities';

// Event envelope used by SimStore. The server guarantees ordering within the
// stream as: tick.start -> update* -> tick.end -> tick.start -> ...
export type SimEvent =
  | { type: 'tick.start'; tick: number; timeMs?: number }
  | { type: 'tick.end'; tick: number; timeMs?: number }
  | {
      type: 'map.created';
      nodes: NodeMap;
      edges: EdgeMap;
      roads: RoadMap;
      buildings: BuildingMap;
    }
  | { type: 'agent.created'; agent: Agent }
  | { type: 'truck.created'; truck: Truck }
  | { type: 'building.created'; building: Parking | Site }
  | { type: 'agent.updated'; id: AgentId; patch: Record<string, unknown> }
  | { type: 'agent.deleted'; id: AgentId }
  | {
      type: 'simulation.config';
      config: { speed: number; tickRate: number };
    };

export type SimEventType = SimEvent['type'];
