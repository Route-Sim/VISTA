---
title: 'Request Tracker'
summary: 'Resolves in-flight requests by matching incoming signals with optional correlation IDs and timeouts.'
source_paths:
  - 'src/net/request-tracker.ts'
last_updated: '2025-10-29'
owner: 'Mateusz Polis'
tags: ['module', 'net', 'reliability']
links:
  parent: '../../SUMMARY.md'
  siblings: ['./client.md', './protocol/mapping.md']
---

# request-tracker

> Purpose: Manage promises for actions awaiting eventual signals. Handles interleaving by using matchers and optional `request_id` correlation.

## Responsibilities & Boundaries

- In-scope: Register waiters, evaluate matchers, resolve/reject with timeout, cancel on disconnect.
- Out-of-scope: Transport, protocol schemas, domain logic.

## Public API / Usage

```ts
const tracker = new RequestTracker(10_000);
const p = tracker.waitFor((sig) => sig.signal === 'agent.created');
// When a matching signal arrives:
tracker.handleSignal({
  signal: 'agent.created',
  data: { agent_id: 'A' },
} as any);
```

## Implementation Notes

- Each pending item stores a matcher, handlers, and timer handle.
- If both `request_id`s exist, equality is enforced prior to matcher evaluation.

## References

- Client: [`./client`](./client.md)
- Mapping: [`./protocol/mapping`](./protocol/mapping.md)
