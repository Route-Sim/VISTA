---
title: 'Reducer Registry and Update Semantics'
summary: 'Typed reducer registry dispatches per-entity update events into a working draft snapshot. Shallow-merge semantics for objects; arrays are replaced.'
source_paths:
  - 'src/sim/store/reducer-registry.ts'
  - 'src/sim/store/reducers.ts'
  - 'src/sim/events.ts'
last_updated: '2025-11-01'
owner: 'Mateusz Nędzi'
tags: ['module', 'sim', 'reducers', 'events']
links:
  parent: '../../../SUMMARY.md'
  siblings: []
---

# Reducer Registry and Update Semantics

> Purpose: Keep mutation logic composable and testable. Each event type registers a pure reducer. The registry dispatches incoming events to the appropriate reducers.

## Semantics

- `*.updated` events perform a shallow merge of object fields.
- Arrays are replaced wholesale; use explicit add/remove events later if needed.
- Events are applied in arrival order within a tick.

## Essential Signatures

```ts
export type Reducer = (draft: SimDraft, evt: SimEvent) => void;
export class ReducerRegistry {
  register(type: SimEventType, reducer: Reducer): void;
  dispatch(draft: SimDraft, evt: SimEvent): void;
}
```

## Default Reducers (initial)

- `agent.updated` — shallow-merge agent fields
- `building.updated` — shallow-merge building/Depot/GasStation
- `site.updated` — shallow-merge Site (narrowed by kind)

## Notes

- Idempotency and event de-duplication can be added in `SimStore` using a short LRU keyed by optional `eventId`.
