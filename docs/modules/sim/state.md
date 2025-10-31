---
title: 'Simulation State Helpers'
summary: 'Defines typed collection maps and snapshot structures that underpin the store and selectors.'
source_paths:
  - 'src/sim/state.ts'
last_updated: '2025-10-31'
owner: 'Mateusz Nędzi'
tags: ['module', 'sim', 'state']
links:
  parent: '../../SUMMARY.md'
  siblings:
    ['./store/index.md', './selectors/index.md']
---

# Simulation State Helpers

> **Purpose:** Describe the canonical aggregate shape for all simulation entities and supply factory helpers for empty collections.

## Context & Motivation

- Centralising collection typing ensures the store, systems, and adapters share the same map structure and key/value semantics.

## Responsibilities & Boundaries

- In-scope: `SimulationCollections` for mutable maps and `SimulationSnapshot` for read-only projections, plus the `createEmptyCollections()` helper.
- Out-of-scope: mutation logic; that belongs to `SimulationState` in the store package.

## References

- [Simulation Store](./store/index.md)
- [Simulation Selectors](./selectors/index.md)

