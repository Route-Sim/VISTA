---
title: 'Node'
summary: 'Describes the graph node entity that anchors buildings in the logistics network and enforces immutability of membership lists.'
source_paths:
  - 'src/sim/domain/node.ts'
last_updated: '2025-10-31'
owner: 'Mateusz Nędzi'
tags: ['module', 'sim', 'domain', 'graph']
links:
  parent: '../../SUMMARY.md'
  siblings: ['./edge.md', './road.md', './building.md', './index.md']
---

# Node

> **Purpose:** Represent a navigable waypoint in the transport graph and track which buildings attach to that coordinate.

## Context & Motivation

- Nodes form the vertices of the map graph. Each holds references to buildings so we can quickly discover depots, sites, or gas stations colocated at that junction.
- The immutable design avoids accidental cross-frame mutations while still permitting fluent add/remove operations via new instances.

## Responsibilities & Boundaries

- In-scope: ID management, membership list of building IDs, helper predicates (`hasBuilding`).
- Out-of-scope: Road/edge connectivity (handled by `Edge`/`Road`), positional math, rendering coordinates.

## Architecture & Design

- Stores building IDs inside a `Set` to enforce uniqueness while exposing read-only arrays via `listBuildingIds()`.
- Mutators `addBuilding` and `removeBuilding` return fresh `Node` instances, keeping previous snapshots intact for interpolation.

## Public API / Usage

```16:31:src/sim/domain/node.ts
const node = new Node({ id: 'N1' });
const next = node.addBuilding('B1');
next.listBuildingIds(); // ['B1']
```

## References

- [Edge](./edge.md)
- [Building](./building.md)
- [Simulation State Helpers](../state.md)
