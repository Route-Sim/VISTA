---
title: 'To View Adapter'
summary: 'Transforms simulation snapshots into lightweight DTOs tailored for three.js scene assembly without leaking domain classes.'
source_paths:
  - 'src/sim/adapters/to-view.ts'
last_updated: '2025-10-31'
owner: 'Mateusz Nędzi'
tags: ['module', 'sim', 'adapters', 'view']
links:
  parent: '../../SUMMARY.md'
  siblings: ['./from-network.md', '../store/snapshot-buffer.md']
---

# To View Adapter

> **Purpose:** Produce plain objects from domain snapshots so the view layer and three.js scene remain decoupled from domain implementations.

## Context & Motivation

- Three.js expects serialisable data shapes; the view adapter flattens class instances into DTOs with arrays rather than Sets or Maps.

## Responsibilities & Boundaries

- In-scope: `toViewModel()` aggregator plus per-entity mappers (nodes, roads, buildings, depots, packages, trucks).
- Out-of-scope: actual rendering or instancing; the view layer consumes the DTOs.

## Implementation Notes

- Derives arrays from domain methods such as `listTruckIds()` to maintain referential clarity while avoiding direct mutation.
- Supports CO₂, fuel, and speed data so visual overlays can evolve without touching the domain.

## References

- [Simulation Snapshot Buffer](../store/snapshot-buffer.md)
- [View Layer](../../view/index.md)
