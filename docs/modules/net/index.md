---
title: "Network Layer – Index"
summary: "Public entry point for the WebSocket network layer, barrel exports, and a ready-to-use client instance."
source_paths:
- "src/net/index.ts"
last_updated: "2025-10-29"
owner: "Mateusz Polis"
tags: ["module", "net", "api"]
links:
  parent: "../../SUMMARY.md"
  siblings: [
    "./protocol/schema.md",
    "./protocol/mapping.md",
    "../backoff.md",
    "../events.md",
    "./transport/browser-websocket.md",
    "../request-tracker.md",
    "../client.md"
  ]
---

# net/index

> Purpose: Provide a stable surface for consumers of the network layer. Exposes types, schemas, mapping utilities, backoff strategy, transport, and a `WebSocketClient` instance.

## Responsibilities & Boundaries

- In-scope: Aggregate exports and construct a default `net` instance using app config and backoff strategy.
- Out-of-scope: Direct mutation of application state, rendering, or domain logic.

## Public API / Usage

```ts
import { net } from "@/net";

net.connect();

// Subscribe to a typed signal
const off = net.on("simulation.started", ({ tick_rate }) => {
  console.log("tick_rate:", tick_rate);
});

// Send a typed action and await the eventual response
const res = await net.sendAction("simulation.start", { tick_rate: 30 });
```

## References

- Schemas: [`protocol/schema`](./protocol/schema.md)
- Mapping: [`protocol/mapping`](./protocol/mapping.md)
- Backoff: [`../backoff`](../backoff.md)
- Transport: [`./transport/browser-websocket`](./transport/browser-websocket.md)
- Request Tracker: [`../request-tracker`](../request-tracker.md)
- Client: [`../client`](../client.md)


