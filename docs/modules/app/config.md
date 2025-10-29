---
title: "App Config – WebSocket URL"
summary: "Centralized resolution of the WebSocket endpoint with environment override and safe fallbacks for local development."
source_paths:
- "src/app/config.ts"
last_updated: "2025-10-29"
owner: "Mateusz Polis"
tags: ["module", "app", "config", "net"]
links:
  parent: "../../SUMMARY.md"
  siblings: []
---

# app/config

> Purpose: Provide a single source of truth for the WebSocket endpoint used by the network layer, reading from `VITE_WS_URL` when present and falling back to a protocol-aware default.

## Context & Motivation

- Keep transport configuration centralized and environment-driven.
- Support secure (wss) and insecure (ws) schemes depending on the page protocol.
- Provide a localhost fallback for development.

## Responsibilities & Boundaries

- In-scope: Resolve URL string for the WebSocket transport.
- Out-of-scope: Connection logic, reconnection policy, protocol schemas.

## Public API / Usage

```ts
import { wsUrl } from "@/app/config";
// wsUrl is a string like "wss://example.com/ws" or "ws://localhost:8080/ws"
```

## Implementation Notes

- `resolveWsUrl()` prefers `import.meta.env.VITE_WS_URL`.
- If not set and running in a browser, it derives the scheme from `location.protocol` and uses `location.host`.
- Final fallback is `ws://localhost:8080/ws`.

## References

- Network client: [`net/client`](../../modules/net/client.md)
- Transport: [`net/transport/browser-websocket`](../../modules/net/transport/browser-websocket.md)


