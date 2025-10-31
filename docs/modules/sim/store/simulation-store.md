---
title: 'SimulationStore'
summary: 'Publisher that wraps `SimulationState`, delivering immutable snapshots and optional buffering for interpolation.'
source_paths:
  - 'src/sim/store/simulation-store.ts'
last_updated: '2025-10-31'
owner: 'Mateusz Nędzi'
tags: ['module', 'sim', 'store']
links:
  parent: '../../SUMMARY.md'
  siblings:
    ['./simulation-state.md', './snapshot-buffer.md']
---

# SimulationStore

> **Purpose:** Coordinate state updates, notify subscribers, and feed recent snapshots into a buffer for rendering-friendly interpolation.

## Context & Motivation

- The web client needs to react to incoming network frames without mutation races. The store queues reducers and emits fresh snapshots.

## Responsibilities & Boundaries

- In-scope: subscriber registry, `update` reducer pipeline, optional `SnapshotBuffer` integration, synchronous emission.
- Out-of-scope: asynchronous scheduling, network IO.

## Architecture & Design

- Accepts an optional `SnapshotBuffer`; when provided, `emit()` pushes a timestamped snapshot using `performance.now()` (fallbacks to `Date.now()`).
- The `subscribe()` method immediately publishes the current snapshot to keep consumers in sync.

## References

- [SnapshotBuffer](./snapshot-buffer.md)
- [SimulationState](./simulation-state.md)

