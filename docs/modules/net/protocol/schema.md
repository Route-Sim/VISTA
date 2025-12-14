---
title: 'Protocol Schemas – Actions & Signals'
summary: 'Strongly typed zod schemas and TypeScript unions for actions and signals, with envelope types and codec helpers.'
source_paths:
  - 'src/net/protocol/schema.ts'
last_updated: '2025-12-14'
owner: 'Mateusz Nędzi'
tags: ['module', 'net', 'protocol', 'zod']
links:
  parent: '../../../SUMMARY.md'
  siblings: ['./mapping.md']
---

# protocol/schema

> Purpose: Define the protocol contract at the edge. Every inbound signal is validated via zod; outbound actions are constructed from typed helpers to ensure correctness.

## Responsibilities & Boundaries

- In-scope: Actions and signals schemas, envelope types, and codec helpers.
- Out-of-scope: Transport, reconnection policy, request tracking.

## Key Types

```ts
type ActionName =
  | 'simulation.start'
  | 'simulation.stop'
  | 'simulation.resume'
  | 'simulation.pause'
  | 'map.create'
  | 'map.export'
  | 'map.import'
  | 'tick_rate.update'
  | 'agent.create'
  | 'agent.update'
  | 'agent.delete'
  | 'agent.get';

type SignalName =
  | 'simulation.started'
  | 'simulation.stopped'
  | 'simulation.resumed'
  | 'simulation.paused'
  | 'simulation.updated'
  | 'tick.start'
  | 'tick.end'
  | 'map.created'
  | 'agent.created'
  | 'agent.updated'
  | 'agent.deleted'
  | 'agent.listed'
  | 'agent.described'
  | 'building.updated'
  | 'package.created'
  | 'error';
```

## Envelopes

```ts
type ActionEnvelopeOf<A extends ActionName> = {
  action: A;
  params: ActionParams[A];
  request_id?: string;
};

type SignalEnvelopeOf<S extends SignalName> = {
  signal: S;
  data: SignalData[S];
  request_id?: string;
};
```

## Codec Helpers

```ts
decodeSignal(raw: unknown): SignalUnion
decodeAction(raw: unknown): ActionUnion
encodeAction(action: ActionName, params: ActionParams[ActionName], requestId?: string): ActionEnvelopeOf<ActionName>
```

## Implementation Notes

- `.catchall(z.unknown())` is used sparingly where extensibility is expected.
- Discriminated unions are constructed programmatically from schema maps to avoid drift.

## Action: map.create

Parameters (validated strictly):

```ts
{
  map_width: number (>0),
  map_height: number (>0),
  num_major_centers: integer (>=1),
  minor_per_major: number (>=0),
  center_separation: number (>0),
  urban_sprawl: number (>0),
  local_density: number (>0),
  rural_density: number (>=0),
  intra_connectivity: number (0..1),
  inter_connectivity: number (>=1),
  arterial_ratio: number (0..1),
  gridness: number (0..1),
  ring_road_prob: number (0..1),
  highway_curviness: number (0..1),
  rural_settlement_prob: number (0..1),
  seed: integer
}
```

## Signal: map.created

The server responds with a detailed summary and a 2D graph suitable for HUD visualization.

## Signal: agent.created

The `agent.created` payload is now a discriminated union that provides a rich snapshot of the agent immediately after creation. The base shape applies to both variants:

```ts
type AgentEnvelopeBase = {
  id: string;
  kind: 'truck' | 'building';
  inbox_count: number;   // >= 0
  outbox_count: number;  // >= 0
  tags: Record<string, unknown>; // defaults to {}
};
```

### Building agents

```ts
type BuildingAgentPayload = AgentEnvelopeBase & {
  kind: 'building';
  building: {
    id: string;
    // server may add more building fields in future revisions
  };
};
```

Example:

```json
{
  "signal": "agent.created",
  "data": {
    "id": "test3",
    "kind": "building",
    "tags": {},
    "inbox_count": 0,
    "outbox_count": 0,
    "building": {
      "id": "test3"
    }
  }
}
```

### Truck agents

```ts
type GraphIndex = string | number;

type TruckAgentPayload = AgentEnvelopeBase & {
  kind: 'truck';
  max_speed_kph: number;      // >= 0
  current_speed_kph: number;  // >= 0
  current_node: GraphIndex;
  current_edge: GraphIndex | null;
  edge_progress_m: number;    // >= 0
  route: GraphIndex[];
  destination: GraphIndex | null;
};
```

Example:

```json
{
  "signal": "agent.created",
  "data": {
    "id": "test2",
    "kind": "truck",
    "max_speed_kph": 100.0,
    "current_speed_kph": 0.0,
    "current_node": 110,
    "current_edge": null,
    "edge_progress_m": 0.0,
    "route": [],
    "destination": null,
    "inbox_count": 0,
    "outbox_count": 0,
    "tags": {}
  }
}
```

The schema allows additional truck-specific fields via `.catchall(z.unknown())`, so downstream code should rely on the documented subset above.

## Signal: agent.updated

The `agent.updated` signal provides the full current state of an agent per tick. The payload varies by agent kind.

### Truck Agent Updated

```ts
type TruckAgentUpdatedPayload = {
  id: string;
  kind: 'truck';
  max_speed_kph: number;
  capacity: number;
  loaded_packages: string[];
  current_speed_kph: number;
  current_node: GraphIndex | null;
  current_edge: GraphIndex | null;
  route: GraphIndex[];
  route_start_node: GraphIndex | null;
  route_end_node: GraphIndex | null;
  current_building_id: string | null;
  driving_time_s: number;
  resting_time_s: number;
  is_resting: boolean;
  balance_ducats: number;
  risk_factor: number;           // 0..1
  is_seeking_parking: boolean;
  original_destination: GraphIndex | null;
  fuel_tank_capacity_l: number;
  current_fuel_l: number;
  co2_emitted_kg: number;
  is_seeking_gas_station: boolean;
  is_fueling: boolean;
  agent_id: string;
  tick: number;
};
```

### Broker Agent Updated

```ts
type BrokerAgentUpdatedPayload = {
  id: string;
  kind: 'broker';
  balance_ducats: number;
  queue_size: number;
  assigned_count: number;
  has_active_negotiation: boolean;
  agent_id: string;
  tick: number;
};
```

## Signal: building.updated

The `building.updated` signal provides the current state of a building. Building types include `site`, `parking`, and `gas_station`.

### Site Building

```ts
type PackageConfig = {
  size_range: [number, number];
  value_range_currency: [number, number];
  pickup_deadline_range_ticks: [number, number];
  delivery_deadline_range_ticks: [number, number];
  priority_weights: Record<string, number>;
  urgency_weights: Record<string, number>;
};

type BuildingStatistics = {
  packages_generated: number;
  packages_picked_up: number;
  packages_delivered: number;
  packages_expired: number;
  total_value_delivered: number;
  total_value_expired: number;
};

type SiteBuildingPayload = {
  building_id: string;
  building: {
    id: string;
    type: 'site';
    capacity: number;
    current_agents: string[];
    name: string;
    activity_rate: number;
    loading_rate_tonnes_per_min: number;
    destination_weights: Record<string, number>;
    package_config: PackageConfig;
    active_packages: string[];
    statistics: BuildingStatistics;
  };
  tick: number;
};
```

### Parking and Gas Station Buildings

```ts
type ParkingBuildingPayload = {
  id: string;
  type: 'parking';
  capacity: number;
  current_agents: string[];
};

type GasStationBuildingPayload = {
  id: string;
  type: 'gas_station';
  capacity: number;
  current_agents: string[];
  cost_factor: number;
};
```

## Signal: package.created

The `package.created` signal is emitted when a new package is generated at a site.

```ts
type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
type DeliveryUrgency = 'STANDARD' | 'EXPRESS' | 'SAME_DAY';

type PackageCreatedPayload = {
  package_id: string;
  origin_building_id: string;
  destination_building_id: string;
  size: number;
  value_currency: number;
  priority: Priority;
  urgency: DeliveryUrgency;
  pickup_deadline_tick: number;
  delivery_deadline_tick: number;
  created_at_tick: number;
  tick: number;
};
```

## Signals: tick.start / tick.end

The server delimits each simulation tick with a start and end signal:

```json
{ "signal": "tick.start", "data": { "tick": 32 } }
{ "signal": "tick.end",   "data": { "tick": 32 } }
```

Client code should apply updates between `tick.start` and `tick.end`; snapshot commits occur on `tick.end`.

### RoadClass

```ts
type RoadClass = 'A' | 'S' | 'GP' | 'G' | 'Z' | 'L' | 'D';
```

### Graph

```ts
type GraphNode = { id: string; x: number; y: number };
type GraphEdge = {
  id: string;
  from_node: string;
  to_node: string;
  length_m: number;
  mode: number;            // transport mode code
  road_class: RoadClass;   // functional class
  lanes: number;           // >= 1
  max_speed_kph: number;   // >= 0
  weight_limit_kg: number | null; // null if not applicable
};
```

### Payload

```ts
{
  // echoes creation params...
  map_width: number;
  map_height: number;
  num_major_centers: number;
  minor_per_major: number;
  center_separation: number;
  urban_sprawl: number;
  local_density: number;
  rural_density: number;
  intra_connectivity: number;
  inter_connectivity: number;
  arterial_ratio: number;
  gridness: number;
  ring_road_prob: number;
  highway_curviness: number;
  rural_settlement_prob: number;
  urban_sites_per_km2: number;
  rural_sites_per_km2: number;
  urban_activity_rate_range: [number, number];
  rural_activity_rate_range: [number, number];
  seed: number;

  // generation summary
  generated_nodes: number;
  generated_edges: number;
  generated_sites: number;

  // graph
  graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
}
```

## References

- Mapping: [`./mapping`](./mapping.md)
- Client: [`../../client`](../../client.md)
