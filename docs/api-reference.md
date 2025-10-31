---
title: 'API Reference – WebSocket Protocol'
summary: 'Typed actions and signals exchanged between VISTA and SPINE with zod-validated envelopes and examples.'
source_paths:
  - 'src/net/protocol/schema.ts'
  - 'src/net/protocol/mapping.ts'
last_updated: '2025-10-31'
owner: 'Mateusz Polis'
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
map.create: { size: number, ... }
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
map.created: { size: number, ... }
map.exported: { filename: string, base64_file: string }
map.imported: {}
tick_rate.updated: { tick_rate: number }
agent.created: { agent_id: string, agent_kind: string, ... }
agent.updated: { agent_id: string, ... }
agent.deleted: { agent_id: string }
agent.state: { agent_id: string, agent_kind: string, ... }
event.created: { event_name: string, ... }
building.updated: { building_id: string, ... }
error: { code: string, message: string }
```

Example (server → client):

```json
{
  "signal": "simulation.started",
  "data": { "tick_rate": 30 },
  "request_id": "c6f8..."
}
```

## Request/Response Matching

- Preferred: include `request_id` in actions; server echoes it in responding signals.
- Fallback: default matcher uses the action→signal mapping; supports interleaved signals.
- Errors: `signal: "error"` may carry `request_id`; the client resolves the pending promise with this error envelope.

## Connection Lifecycle

- Reconnect: Exponential backoff with jitter (0.5s → 30s cap). See [`net/backoff`](modules/net/backoff.md).
- Transport: Browser WebSocket wrapper with lifecycle hooks. See [`net/transport/browser-websocket`](modules/net/transport/browser-websocket.md).
- Client API: `connect()`, `disconnect()`, `on(signal, handler)`, `onAny(handler)`, `sendAction()`, `waitFor()`. See [`net/client`](modules/net/client.md).
