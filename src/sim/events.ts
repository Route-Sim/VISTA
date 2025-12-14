import type { AgentId, BrokerId, BuildingId, PackageId } from './domain/ids';
import type {
  Agent,
  Broker,
  GasStation,
  Package,
  Parking,
  Site,
  Truck,
} from './domain/entities';
import type { BuildingMap, EdgeMap, NodeMap, RoadMap } from './domain/entities';

// Event envelope used by SimStore. The server guarantees ordering within the
// stream as: tick.start -> update* -> tick.end -> tick.start -> ...
export type SimEvent =
  | {
      type: 'tick.start';
      tick: number;
      timeMs?: number;
      /** Simulation time in 24h float format (e.g., 12.5 = 12:30) */
      simTime: number;
      /** Simulation day (1-indexed) */
      simDay: number;
    }
  | {
      type: 'tick.end';
      tick: number;
      timeMs?: number;
      /** Simulation time in 24h float format (e.g., 12.5 = 12:30) */
      simTime: number;
      /** Simulation day (1-indexed) */
      simDay: number;
    }
  | {
      type: 'map.created';
      nodes: NodeMap;
      edges: EdgeMap;
      roads: RoadMap;
      buildings: BuildingMap;
    }
  | { type: 'agent.created'; agent: Agent }
  | { type: 'truck.created'; truck: Truck }
  | { type: 'truck.updated'; id: AgentId; patch: Partial<Truck> }
  | { type: 'broker.created'; broker: Broker }
  | { type: 'broker.updated'; id: BrokerId; patch: Partial<Broker> }
  | { type: 'building.created'; building: Parking | Site | GasStation }
  | {
      type: 'building.updated';
      id: BuildingId;
      patch: Partial<Parking | Site | GasStation>;
    }
  | { type: 'package.created'; pkg: Package }
  | { type: 'package.updated'; id: PackageId; patch: Partial<Package> }
  | { type: 'agent.updated'; id: AgentId; patch: Record<string, unknown> }
  | { type: 'agent.deleted'; id: AgentId }
  | {
      type: 'simulation.config';
      config: { speed: number; tickRate: number };
    };

export type SimEventType = SimEvent['type'];
