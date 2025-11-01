---
title: 'Net Telemetry'
summary: 'Typed stream of connection lifecycle and IO events (incoming/outgoing) exposed for diagnostics and HUD rendering. Wired at the transport boundary to preserve client purity.'
source_paths:
  - 'src/net/telemetry.ts'
  - 'src/net/index.ts'
last_updated: '2025-11-01'
owner: 'Mateusz Nędzi'
tags: ['module', 'net', 'telemetry', 'hud']
links:
  parent: '../../SUMMARY.md'
  siblings: []
---

# Net Telemetry

> Purpose: Provide a composable event stream for connection (`connecting|open|close|error`) and IO (`incoming-raw|incoming-signal|outgoing`) without modifying protocol/client code.

## Context & Motivation

- Observability is essential for debugging message flow and connection state.
- Emitting events at the transport seam avoids polluting domain or protocol layers.

## Responsibilities & Boundaries

- Emits `NetTelemetryEvent` union through an `EventBus` under a single `event` channel.
- Enriches outgoing with `action` and `request_id` when available; enriches incoming with decoded `SignalUnion` via `WebSocketClient.onAny`.

## Architecture & Design

- `netTelemetry: EventBus<{ event: NetTelemetryEvent }>` singleton.
- `wireNetTelemetry(client, transport)` subscribes to:
  - `transport.onConnecting`, `onOpen`, `onClose`, `onError` → `dir: 'conn'` events
  - `transport.onMessage` → `dir: 'in', kind: 'incoming-raw'`
  - `client.onAny` → `dir: 'in', kind: 'incoming-signal'`
  - `transport.onOutgoing` → `dir: 'out', kind: 'outgoing'`

## Public API / Usage

```ts
import { netTelemetry, wireNetTelemetry } from '@/net/telemetry';
import { WebSocketClient } from '@/net/client';
import { InstrumentedTransport } from '@/net/transport/instrumented-transport';

const off = netTelemetry.on('event', (e) => console.debug(e));
// later: off();
```

## Implementation Notes

- Uses safe JSON parsing to avoid exceptions when inspecting text payloads.
- Byte length computed with `TextEncoder` when available; falls back to UTF-8 approximation.

## References

- `src/net/telemetry.ts`
- `src/net/transport/instrumented-transport.ts`
- `src/net/index.ts`
