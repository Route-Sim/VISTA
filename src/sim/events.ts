import type { AgentId } from './domain/ids';
import type { Agent } from './domain/entities';
import type { EdgeMap, NodeMap, RoadMap } from './domain/entities';

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
    }
  | { type: 'agent.created'; agent: Agent }
  | { type: 'agent.updated'; id: AgentId; patch: Record<string, unknown> }
  | { type: 'agent.deleted'; id: AgentId };

export type SimEventType = SimEvent['type'];
