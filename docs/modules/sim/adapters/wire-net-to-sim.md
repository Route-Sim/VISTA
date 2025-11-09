---
title: 'Adapter – wireNetToSim'
summary: 'Bridges network signals to the simulation store by subscribing to tick/map events and ingesting mapped domain events.'
source_paths:
  - 'src/sim/adapters/wire-net-to-sim.ts'
  - 'src/sim/adapters/net-adapter.ts'
last_updated: '2025-11-09'
owner: 'Mateusz Nędzi'
tags: ['module', 'sim', 'adapters', 'net']
links:
  parent: '../../../SUMMARY.md'
  siblings: []
---

# wireNetToSim

> Purpose: Provide a single, composable wiring point between the IO layer (`net/*`) and the domain store (`sim/*`). It subscribes to relevant signals (`tick.start`, `tick.end`, `map.created`), adapts payloads where needed (via `mapNetEvent`), and forwards them to `SimStore.ingest`.

## Responsibilities & Boundaries

- In-scope:
  - Subscribe to network signals on a provided `WebSocketClient`.
  - Map wire payloads into domain events.
  - Ingest events into a provided `SimStore`.
- Out-of-scope:
  - Business logic/reducers (`sim/store/reducers.ts`).
  - Transport details or connection lifecycle (`net/transport/*`).

## Public API / Usage

```ts
import { wireNetToSim } from '@/sim';
import { net } from '@/net';
import { SimStore } from '@/sim';

const store = new SimStore();
const off = wireNetToSim(net, store);
// later: off() to unsubscribe
```

## Implementation Notes

- Uses `performance.now()` (fallback to `Date.now()`) for `timeMs` on tick events to keep interpolation stable.
- Returns a single unsubscribe function that detaches all handlers.

## References

- Mapping: `src/sim/adapters/net-adapter.ts`
- Store: `src/sim/store/sim-store.ts`
