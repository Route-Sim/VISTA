---
title: 'SimulationState'
summary: 'Immutable wrapper around collection maps that provides fluent builders for inserting or removing entities.'
source_paths:
  - 'src/sim/store/simulation-state.ts'
last_updated: '2025-10-31'
owner: 'Mateusz Nędzi'
tags: ['module', 'sim', 'store']
links:
  parent: '../../SUMMARY.md'
  siblings:
    ['./simulation-store.md', './snapshot-buffer.md', '../state.md']
---

# SimulationState

> **Purpose:** Maintain the authoritative mutable collections internally while exposing immutable builders that return new instances on every change.

## Context & Motivation

- Systems need to chain updates without mutating shared references; `SimulationState` handles the cloning of underlying maps.

## Responsibilities & Boundaries

- In-scope: `with*`/`without*` methods per entity type, snapshot generation, and map cloning utilities.
- Out-of-scope: subscription management (handled by `SimulationStore`), time history (`SnapshotBuffer`).

## Architecture & Design

- Internally stores a `SimulationCollections` struct; private helpers (`set`, `delete`, `cloneMap`) encapsulate map copying.
- `snapshot()` returns new `Map` instances, ensuring subscribers cannot mutate the live store.

## References

- [Simulation Store](./simulation-store.md)
- [Selectors](../selectors/index.md)

