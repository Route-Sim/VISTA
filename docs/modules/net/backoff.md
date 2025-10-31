---
title: 'Exponential Backoff Strategy'
summary: 'Reconnect timing strategy with exponential growth and optional jitter; pluggable via a simple interface.'
source_paths:
  - 'src/net/backoff.ts'
last_updated: '2025-10-29'
owner: 'Mateusz Nędzi'
tags: ['module', 'net', 'reliability']
links:
  parent: '../../SUMMARY.md'
  siblings: ['./transport/browser-websocket.md']
---

# backoff

> Purpose: Provide a robust reconnection strategy. The transport requests the next delay from this strategy between connection attempts.

## Responsibilities & Boundaries

- In-scope: Backoff API, exponential implementation, jitter control, cap.
- Out-of-scope: Transport details and WebSocket state management.

## Public API / Usage

```ts
export interface BackoffStrategy {
  reset(): void;
  nextDelayMs(): number;
}

export class ExponentialBackoff implements BackoffStrategy {
  constructor({
    initialDelayMs = 500,
    factor = 2,
    maxDelayMs = 30_000,
    jitterRatio = 0.2,
  } = {}) {}
}
```

## Implementation Notes

- `reset()` on successful open; `nextDelayMs()` on failure or close.
- Jitter prevents thundering herds by randomizing the delay ±`jitterRatio`.

## References

- Transport: [`./transport/browser-websocket`](./transport/browser-websocket.md)
- Client: [`./client`](./client.md)
