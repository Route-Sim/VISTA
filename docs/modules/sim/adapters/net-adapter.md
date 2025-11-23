---
title: "Net Adapter"
summary: "Maps incoming network signals (wire protocol) to pure SimEvents (domain events). Handles impedance mismatch between JSON-schema wire types and internal domain entities."
source_paths:
  - "src/sim/adapters/net-adapter.ts"
last_updated: "2025-11-23"
owner: "Mateusz Nędzi"
tags: ["module", "sim", "adapter", "network"]
links:
  parent: "../../../SUMMARY.md"
  siblings:
    - "wire-net-to-sim.md"
---

# Net Adapter

> Purpose: Translates raw JSON objects from the WebSocket client (`@net`) into typed `SimEvent` objects (`@sim/events`). This layer isolates the simulation core from network protocol changes.

## Context & Motivation

The network protocol (`src/net/protocol/schema.ts`) is designed for efficient wire transport and validation (Zod). The simulation domain (`src/sim/domain`) is designed for fast, immutable state updates and querying. The adapter bridges these two worlds.

## Responsibilities & Boundaries

- In-scope:
  - Inspecting `SignalEnvelope` types.
  - Mapping `map.created` to domain Node/Edge/Road/Building maps.
  - Mapping `agent.created` to specific entity types (Truck, Parking, Site).
  - Mapping `agent.updated` partials to domain field updates.
  - Handling ID branding (casting string IDs to `NodeId`, `TruckId`, etc.).
- Out-of-scope:
  - WebSocket connection management (handled by `wireNetToSim` and `WebSocketClient`).
  - State application (handled by `reducers`).

## Architecture & Design

The module exports a single pure function `mapNetEvent(payload: unknown): SimEvent | undefined`. It performs runtime checks (using Zod schemas or lightweight guards) to identify the signal type and transforms the data.

## Key Mappings

- **Map Creation**: Flattens the nested `GraphNode` structure (which contains buildings) into normalized `nodes`, `buildings`, `edges`, and `roads` maps.
- **Trucks**: Populates domain-specific fields like `inboxCount`, `outboxCount`, `destinationNodeId`, `currentBuildingId` from the wire `AgentSignalData`.
- **Sites**: Extracts `name` and `activityRate` from generic building data.

## Usage

```ts
import { mapNetEvent } from './net-adapter';

const wirePayload = { signal: 'agent.created', data: { ... } };
const simEvent = mapNetEvent(wirePayload);
if (simEvent) {
  store.ingest(simEvent);
}
```

## Implementation Notes

- Uses `asNodeId`, `asTruckId` etc. to enforce nominal typing within the sim domain.
- Handles partial updates for `agent.updated` by remapping wire keys (snake_case) to domain keys (camelCase).

## References

- `src/net/protocol/schema.ts`
- `src/sim/domain/entities.ts`
- `src/sim/events.ts`

