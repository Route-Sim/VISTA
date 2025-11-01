---
title: 'Browser WebSocket Transport'
summary: 'Platform WebSocket adapter implementing connect/send/close with lifecycle events and auto-reconnect using backoff.'
source_paths:
  - 'src/net/transport/browser-websocket.ts'
last_updated: '2025-11-01'
owner: 'Mateusz Nędzi'
tags: ['module', 'net', 'transport']
links:
  parent: '../../../SUMMARY.md'
  siblings: ['../backoff.md']
---

# transport/browser-websocket

> Purpose: Adapt the browser WebSocket API to the transport interface, manage lifecycle events, and perform reconnects when not explicitly closed by the application.

## Responsibilities & Boundaries

- In-scope: Open/close, message dispatch, reconnect scheduling, error surfacing.
- Out-of-scope: Protocol decoding/encoding, request matching, domain side-effects.

## Public API / Usage

```ts
const transport = new BrowserWebSocketTransport({
  url: wsUrl,
  backoff: new ExponentialBackoff(),
});
transport.connect();
transport.onMessage((txt) => console.log(txt));
```

## Lifecycle

- `onOpen` → reset backoff; `onClose` → schedule reconnect unless explicitly closed.
- Message payloads support `string` and `Blob` (converted to text).

## Logging

This transport prints concise console logs for WebSocket lifecycle and traffic to aid debugging:

- **open**: `console.log('[net][ws] open', url)`
- **incoming message**: `console.log('[net][ws] <-', text)` (for `Blob`, after conversion)
- **outgoing message**: `console.log('[net][ws] ->', text)`
- **error**: `console.error('[net][ws] error', event)`
- **close**: `console.log('[net][ws] close', { code, reason, wasClean })`

## References

- Backoff: [`../../backoff`](../../backoff.md)
- Client: [`../../client`](../../client.md)
