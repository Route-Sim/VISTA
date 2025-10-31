---
title: 'Edge'
summary: 'Captures the directional connection between two nodes, forming the base for road specialisations.'
source_paths:
  - 'src/sim/domain/edge.ts'
last_updated: '2025-10-31'
owner: 'Mateusz Nędzi'
tags: ['module', 'sim', 'domain', 'graph']
links:
  parent: '../../SUMMARY.md'
  siblings: ['./node.md', './road.md']
---

# Edge

> **Purpose:** Provide the minimal link between start and end nodes so higher-level classes (e.g., `Road`) can add transport semantics.

## Context & Motivation

- Edges are kept tiny—just IDs—to keep the graph flexible. Specialisations like `Road` extend them with traffic attributes.

## Responsibilities & Boundaries

- In-scope: start/end node references, identity accessor helpers.
- Out-of-scope: capacity, speed limits, traversal state; `Road` handles those.

## Implementation Notes

- `Edge` is immutable; it exposes getters only, making it safe to share between snapshots.

## References

- [Node](./node.md)
- [Road](./road.md)
