---
title: 'API Reference – WebSocket Protocol'
summary: 'Typed actions and signals exchanged between VISTA and SPINE with zod-validated envelopes and examples.'
source_paths:
  - 'src/net/protocol/schema.ts'
  - 'src/net/protocol/mapping.ts'
last_updated: '2025-11-09'
owner: 'Mateusz Nędzi'
tags: ['api', 'net', 'protocol']
links:
  parent: './SUMMARY.md'
  siblings: []
---

# WebSocket API Protocol

> Purpose: This document specifies the runtime-validated protocol used by the network layer. All inbound messages are validated at the edge using zod; outbound messages are constructed from strongly-typed helpers.

## Message Envelopes

- Action (client → server): `{ action: ActionName, params: ActionParams[ActionName], request_id? }`
- Signal (server → client): `{ signal: SignalName, data: SignalData[SignalName], request_id? }`

See detailed schemas: [`protocol/schema`](modules/net/protocol/schema.md) and mapping logic: [`protocol/mapping`](modules/net/protocol/mapping.md).

## Actions

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
```

Params per action (TypeScript/zod enforced):

```ts
simulation.start: { tick_rate: number }
simulation.stop: {}
simulation.resume: {}
simulation.pause: {}
map.create: {
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
map.export: { map_name: string }
map.import: { base64_file: string }
tick_rate.update: { tick_rate: number }
agent.create: { agent_id: string, agent_kind: string, ... }
agent.update: { agent_id: string, ... }
agent.delete: { agent_id: string }
agent.get: { agent_id: string }
```

Example (client → server):

```json
{
  "action": "simulation.start",
  "params": { "tick_rate": 30 },
  "request_id": "c6f8..."
}
```

## Signals

```ts
type SignalName =
  | 'simulation.started'
  | 'simulation.stopped'
  | 'simulation.resumed'
  | 'simulation.paused'
  | 'tick.start'
  | 'tick.end'
  | 'map.created'
  | 'map.exported'
  | 'map.imported'
  | 'tick_rate.updated'
  | 'agent.created'
  | 'agent.updated'
  | 'agent.deleted'
  | 'agent.state'
  | 'event.created'
  | 'building.updated'
  | 'error';
```

Data per signal (TypeScript/zod enforced):

```ts
simulation.started: { tick_rate: number }
simulation.stopped: {}
simulation.resumed: {}
simulation.paused: {}
tick.start: { tick: number }
tick.end: { tick: number }
map.created: {
  // echoes params...
  map_width: number; map_height: number; num_major_centers: number; minor_per_major: number;
  center_separation: number; urban_sprawl: number; local_density: number; rural_density: number;
  intra_connectivity: number; inter_connectivity: number; arterial_ratio: number; gridness: number;
  ring_road_prob: number; highway_curviness: number; rural_settlement_prob: number;
  urban_sites_per_km2: number; rural_sites_per_km2: number;
  urban_activity_rate_range: [number, number]; rural_activity_rate_range: [number, number];
  seed: number;
  // summary
  generated_nodes: number; generated_edges: number; generated_sites: number;
  // graph
  graph: {
    nodes: { id: string; x: number; y: number }[];
    edges: {
      id: string; from_node: string; to_node: string; length_m: number;
      mode: number; road_class: 'A'|'S'|'GP'|'G'|'Z'|'L'|'D'; lanes: number; max_speed_kph: number;
      weight_limit_kg: number | null;
    }[];
  };
}
map.exported: { filename: string, base64_file: string }
map.imported: {}
tick_rate.updated: { tick_rate: number }
agent.created: AgentCreatedPayload // see detailed breakdown below
agent.updated: { agent_id: string, ... }
agent.deleted: { agent_id: string }
agent.state: { agent_id: string, agent_kind: string, ... }
event.created: { event_name: string, ... }
building.updated: { building_id: string, ... }
error: { code: string, message: string }
```

Examples:

```json
{ "signal": "tick.start", "data": { "tick": 32 } }
{ "signal": "tick.end",   "data": { "tick": 32 } }
```

### CREATE_MAP – Generate New Map Procedurally

Action type: `map.create`

Parameters:

```json
{
  "action": "map.create",
  "params": {
    "map_width": 10000,
    "map_height": 10000,
    "num_major_centers": 3,
    "minor_per_major": 2.0,
    "center_separation": 2500.0,
    "urban_sprawl": 800.0,
    "local_density": 50.0,
    "rural_density": 5.0,
    "intra_connectivity": 0.3,
    "inter_connectivity": 2,
    "arterial_ratio": 0.2,
    "gridness": 0.3,
    "ring_road_prob": 0.5,
    "highway_curviness": 0.2,
    "rural_settlement_prob": 0.15,
    "seed": 42
  }
}
```

Response signal: `map.created` with empty data `{}` (statistics TBD).

Example (server → client; arrays truncated):

```json
{
  "signal": "map.created",
  "data": {
    "map_width": 1000,
    "map_height": 1000,
    "num_major_centers": 3,
    "...": "...",
    "generated_nodes": 142,
    "generated_edges": 356,
    "generated_sites": 13,
    "graph": {
      "nodes": [{ "id": "0", "x": 639.43, "y": 25.01 }, { "...": "..." }],
      "edges": [
        {
          "id": "0",
          "from_node": "50",
          "to_node": "52",
          "length_m": 70.33,
          "mode": 1,
          "road_class": "L",
          "lanes": 1,
          "max_speed_kph": 44.11,
          "weight_limit_kg": 6903.77
        },
        { "...": "..." }
      ]
    }
  }
}
```

### Signal: agent.created – Post-Creation Snapshot

Base payload shared by all agent kinds:

```ts
type AgentEnvelopeBase = {
  id: string;
  kind: 'truck' | 'building';
  inbox_count: number;   // >= 0
  outbox_count: number;  // >= 0
  tags: Record<string, unknown>; // defaults to {}
};
```

Variants:

- Building agents append a `building` object that currently mirrors the identifier and may grow with structural metadata.
- Truck agents provide the full motion state.

```ts
type GraphIndex = string | number;

type BuildingAgentPayload = AgentEnvelopeBase & {
  kind: 'building';
  building: { id: string };
};

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

type AgentCreatedPayload = BuildingAgentPayload | TruckAgentPayload;
```

Examples:

```json
{
  "signal": "agent.created",
  "data": {
    "id": "test3",
    "kind": "building",
    "tags": {},
    "inbox_count": 0,
    "outbox_count": 0,
    "building": { "id": "test3" }
  }
}
```

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

Downstream systems should tolerate additional properties introduced by the server; the schema intentionally uses `.catchall(z.unknown())` on each variant to allow forward-compatible extensions.

## Request/Response Matching

- Preferred: include `request_id` in actions; server echoes it in responding signals.
- Fallback: default matcher uses the action→signal mapping; supports interleaved signals.
- Errors: `signal: "error"` may carry `request_id`; the client resolves the pending promise with this error envelope.

## Connection Lifecycle

- Reconnect: Exponential backoff with jitter (0.5s → 30s cap). See [`net/backoff`](modules/net/backoff.md).
- Transport: Browser WebSocket wrapper with lifecycle hooks. See [`net/transport/browser-websocket`](modules/net/transport/browser-websocket.md).
- Client API: `connect()`, `disconnect()`, `on(signal, handler)`, `onAny(handler)`, `sendAction()`, `waitFor()`. See [`net/client`](modules/net/client.md).
