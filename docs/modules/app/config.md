---
title: 'App Config – WebSocket URL'
summary: 'Centralized resolution of the WebSocket endpoint with environment override and safe fallbacks for local development.'
source_paths:
  - 'src/app/config.ts'
last_updated: '2025-11-01'
owner: 'Mateusz Nędzi'
tags: ['module', 'app', 'config', 'net']
links:
  parent: '../../SUMMARY.md'
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
import { wsUrl } from '@/app/config';
// wsUrl is a string like "wss://example.com/ws" or "ws://localhost:8000/ws"
```

## Implementation Notes

- `resolveWsUrl()` prefers `import.meta.env.VITE_WS_URL` (must be prefixed with `VITE_` for Vite to expose it).
- **Important**: After adding or modifying `.env` files, restart the Vite dev server for changes to take effect. Vite reads `.env` files only at startup.
- In development (`import.meta.env.DEV`), if `VITE_WS_URL` is not set, it connects directly to `ws://localhost:8000/ws` to avoid the Vite dev-server proxy, which can be incompatible with Bun's socket API.
- In production/browser without an explicit env var, it derives the scheme from `location.protocol` and uses `location.host` (e.g., `wss://example.com/ws`).
- Final fallback is `ws://localhost:8000/ws` (non-browser or unspecified host).
- TypeScript types for environment variables are defined in `src/vite-env.d.ts`.

## References

- Network client: [`net/client`](../../modules/net/client.md)
- Transport: [`net/transport/browser-websocket`](../../modules/net/transport/browser-websocket.md)
