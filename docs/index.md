---
title: 'VISTA – Project Overview'
summary: 'High-level overview of the IO → Domain → View architecture and module map, with links to the network layer documentation.'
source_paths:
  - 'src/main.ts'
last_updated: '2025-10-29'
owner: 'Mateusz Nędzi'
tags: ['overview', 'architecture', 'net', 'engine', 'sim', 'view', 'hud']
links:
  parent: './SUMMARY.md'
  siblings: []
---

# Overview

> Purpose: This document introduces the architecture of VISTA (IO → Domain → View) and links to module documentation. The implementation follows a clean separation of concerns to keep networking, simulation, and rendering decoupled.

## Architecture (IO → Domain → View)

- IO (Input/Output): network layer over WebSocket; validates messages and emits typed events.
- Domain: simulation state and systems (pure, serializable); no three.js types.
- View: three.js scene and HUD; applies interpolated frames and renders.

## Module Map

- App
  - [`app/config`](modules/app/config.md)
- Net (Network)
  - [`net/index`](modules/net/index.md)
  - [`net/protocol/schema`](modules/net/protocol/schema.md)
  - [`net/protocol/mapping`](modules/net/protocol/mapping.md)
  - [`net/backoff`](modules/net/backoff.md)
  - [`net/events`](modules/net/events.md)
  - [`net/transport/browser-websocket`](modules/net/transport/browser-websocket.md)
  - [`net/request-tracker`](modules/net/request-tracker.md)
  - [`net/client`](modules/net/client.md)

See the API Reference for the message protocol of actions and signals: [API Reference](api-reference.md).
