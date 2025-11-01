---
title: 'Instrumented Transport'
summary: 'A thin decorator over the WebSocket transport that exposes connecting and outgoing hooks while proxying all standard events. Enables non-invasive telemetry without modifying the core client.'
source_paths:
  - 'src/net/transport/instrumented-transport.ts'
last_updated: '2025-11-01'
owner: 'Mateusz Nędzi'
tags: ['module', 'net', 'transport', 'telemetry']
links:
  parent: '../../../SUMMARY.md'
  siblings: []
---

# Instrumented Transport

> Purpose: Decorates any `IWebSocketTransport` to surface additional hooks for `connecting` and `outgoing` while keeping the transport interface intact. This provides a stable seam for observation and HUD diagnostics.

## Context & Motivation

- Problem: We need IO and connection visibility (incoming/outgoing/open/close/error) without coupling telemetry into the core client or protocol logic.
- Constraints: Keep `WebSocketClient` and `BrowserWebSocketTransport` unchanged (Open/Closed). Telemetry must be optional and composable.
- Approach: A wrapper that proxies `onOpen/onClose/onError/onMessage` and adds `onConnecting` and `onOutgoing` hooks.

## Responsibilities & Boundaries

- In-scope: Emit `connecting` when `connect()` is called; emit `outgoing` when `send()` is invoked; proxy all other events and methods.
- Out-of-scope: Decoding messages, backoff, or reconnect strategy (remain in `BrowserWebSocketTransport`).

## Architecture & Design

- Key class: `InstrumentedTransport(inner: IWebSocketTransport)`.
- Data flow: HUD subscribes via `wireNetTelemetry`, which listens on transport hooks and client decoded signals.

## Public API / Usage

```ts
import { BrowserWebSocketTransport } from '@/net/transport/browser-websocket';
import { InstrumentedTransport } from '@/net/transport/instrumented-transport';

const raw = new BrowserWebSocketTransport(...);
const transport = new InstrumentedTransport(raw);

const offOut = transport.onOutgoing((text) => console.log('OUT', text));
const offConn = transport.onConnecting(() => console.log('connecting'));
```

## Implementation Notes

- The wrapper keeps `readyState` as a getter delegating to `inner.readyState`.
- Hooks run before delegating (`onConnecting` before `inner.connect()`, `onOutgoing` before `inner.send()`).

## References

- `src/net/transport/instrumented-transport.ts`
- `docs/modules/net/telemetry.md`
