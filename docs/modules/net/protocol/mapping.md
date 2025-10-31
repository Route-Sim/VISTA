---
title: 'Action→Signal Mapping'
summary: 'Default mapping from actions to expected response signals, plus a safe matcher for interleaved streams with optional request_id correlation.'
source_paths:
  - 'src/net/protocol/mapping.ts'
last_updated: '2025-10-29'
owner: 'Mateusz Nędzi'
tags: ['module', 'net', 'protocol']
links:
  parent: '../../../SUMMARY.md'
  siblings: ['./schema.md']
---

# protocol/mapping

> Purpose: Associate each action with its canonical response signal and provide a default matcher that tolerates interleaved signals and leverages `request_id` when available.

## Mapping

```ts
simulation.start → simulation.started
simulation.stop → simulation.stopped
simulation.resume → simulation.resumed
map.create → map.created
map.export → map.exported
map.import → map.imported
tick_rate.update → tick_rate.updated
agent.create → agent.created
agent.update → agent.updated
agent.delete → agent.deleted
agent.get → agent.state
```

## Default Matcher

- Matches by expected signal name.
- If both request and signal carry `request_id`, enforces equality.
- Allows the request to resolve even when unrelated signals arrive in-between.

## References

- Schemas: [`./schema`](./schema.md)
- Client: [`../../client`](../../client.md)
