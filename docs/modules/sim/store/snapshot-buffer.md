---
title: 'SnapshotBuffer'
summary: 'Maintains a rolling window of timestamped simulation snapshots for view interpolation or debugging.'
source_paths:
  - 'src/sim/store/snapshot-buffer.ts'
last_updated: '2025-10-31'
owner: 'Mateusz Nędzi'
tags: ['module', 'sim', 'store']
links:
  parent: '../../SUMMARY.md'
  siblings:
    ['./simulation-store.md', './simulation-state.md']
---

# SnapshotBuffer

> **Purpose:** Preserve recent snapshots so the view layer can interpolate between frames or inspect history without querying the store again.

## Context & Motivation

- Rendering often lags behind simulation ticks; a buffer provides the necessary history for smoothing and diagnostic overlays.

## Responsibilities & Boundaries

- In-scope: bounded array storage, helpers for the latest and previous entries, configurable limit.
- Out-of-scope: interpolation logic itself or persistence beyond memory.

## Implementation Notes

- `push()` appends and trims in O(n) worst case but typically operates on tiny windows (< 4 entries).
- Exposes `list()` returning a shallow copy to prevent accidental mutation.

## References

- [SimulationStore](./simulation-store.md)
- [View Adapters](../adapters/to-view.md)

