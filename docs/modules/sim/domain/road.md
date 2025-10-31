---
title: 'Road'
summary: 'Extends the base edge with transport-specific data such as speed limits and live vehicle membership.'
source_paths:
  - 'src/sim/domain/road.ts'
last_updated: '2025-10-31'
owner: 'Mateusz Nędzi'
tags: ['module', 'sim', 'domain', 'transport']
links:
  parent: '../../SUMMARY.md'
  siblings: ['./edge.md', './truck.md', './node.md']
---

# Road

> **Purpose:** Model navigable road segments including permissible speed and the trucks currently traversing them.

## Context & Motivation

- Roads inherit node connectivity from `Edge` and add per-segment constraints used later by movement systems.
- Tracking truck IDs locally allows constant-time queries (`hasTruck`) without scanning the fleet.

## Responsibilities & Boundaries

- In-scope: storing max speed, managing membership of trucks via immutable add/remove helpers.
- Out-of-scope: physics integration, pathfinding, CO₂ calculations—those belong to future systems operating over the store.

## Architecture & Design

- Uses an internal `Set` to enforce unique truck IDs but emits arrays to avoid leaking mutability.
- Mutation helpers clone through the constructor to respect immutability.

## References

- [Truck](./truck.md)
- [Simulation State Helpers](../state.md)
