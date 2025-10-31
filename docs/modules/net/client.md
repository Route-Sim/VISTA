---
title: 'WebSocket Client'
summary: 'High-level client that composes transport, protocol codec, and request tracker to provide a typed event API and promise-based actions.'
source_paths:
  - 'src/net/client.ts'
last_updated: '2025-10-29'
owner: 'Mateusz Nędzi'
tags: ['module', 'net', 'client']
links:
  parent: '../../SUMMARY.md'
  siblings:
    [
      './protocol/schema.md',
      './protocol/mapping.md',
      './transport/browser-websocket.md',
      './request-tracker.md',
    ]
---

# client

> Purpose: Offer a safe, ergonomic interface over WebSocket: subscribe to typed signals, send typed actions, and await responses even with interleaved messages.

## Responsibilities & Boundaries

- In-scope: Connect/disconnect, inbound signal decode and dispatch, request→response matching, error propagation.
- Out-of-scope: Rendering, domain state mutation, heavy buffering.

## Public API / Usage

```ts
import { net } from '@/net';

net.connect();

const off = net.on('simulation.started', ({ tick_rate }) => {
  console.log('started:', tick_rate);
});

const resp = await net.sendAction('simulation.start', { tick_rate: 30 });

off();
```

### Await arbitrary conditions

```ts
await net.waitFor(
  (s) => s.signal === 'agent.created' && s.data.agent_id === 'A',
);
```

## Matching Strategy

- Default: action→signal mapping with optional `request_id` check.
- Custom: caller-provided matcher for disambiguation (e.g., `agent_id`).

## References

- Transport: [`./transport/browser-websocket`](./transport/browser-websocket.md)
- Schemas: [`./protocol/schema`](./protocol/schema.md)
- Mapping: [`./protocol/mapping`](./protocol/mapping.md)
- Request Tracker: [`./request-tracker`](./request-tracker.md)
