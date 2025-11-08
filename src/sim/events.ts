import type { AgentId, BuildingId } from './domain/ids';
import type {
  Agent,
  Building,
  Depot,
  GasStation,
  Site,
} from './domain/entities';
import type { EdgeMap, NodeMap, RoadMap } from './domain/entities';

// Event envelope used by SimStore. The server guarantees ordering within the
// stream as: tick -> update* -> tick -> update* -> ...
export type SimEvent =
  | { type: 'tick'; tick: number; timeMs?: number }
  | {
      type: 'map.created';
      nodes: NodeMap;
      edges: EdgeMap;
      roads: RoadMap;
    }
  | { type: 'agent.updated'; id: AgentId; patch: Partial<Agent> }
  | {
      type: 'building.updated';
      id: BuildingId;
      patch: Partial<Building | Depot | GasStation>;
    }
  | {
      type: 'site.updated';
      id: BuildingId /* SiteId alias */;
      patch: Partial<Site>;
    };

export type SimEventType = SimEvent['type'];
