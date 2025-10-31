---
title: 'Simulation Store Overview'
summary: 'Aggregates state management primitives including the immutable state wrapper, subscriber store, and snapshot buffer.'
source_paths:
  - 'src/sim/store/index.ts'
last_updated: '2025-10-31'
owner: 'Mateusz Nędzi'
tags: ['module', 'sim', 'store']
links:
  parent: '../../SUMMARY.md'
  siblings:
    [
      './simulation-state.md',
      './simulation-store.md',
      './snapshot-buffer.md',
    ]
---

# Simulation Store Overview

> **Purpose:** Explain how state storage components compose to deliver immutable snapshots with lightweight history for interpolation.

## Context & Motivation

- Systems and view adapters rely on consistent snapshots. The store package bundles `SimulationState`, `SimulationStore`, and `SnapshotBuffer` to achieve that.

## References

- [SimulationState Class](./simulation-state.md)
- [SimulationStore](./simulation-store.md)
- [SnapshotBuffer](./snapshot-buffer.md)

