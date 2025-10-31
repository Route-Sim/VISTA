---
title: 'Building'
summary: 'Defines a shared base for all facilities attached to nodes, encapsulating truck docking management.'
source_paths:
  - 'src/sim/domain/building.ts'
last_updated: '2025-10-31'
owner: 'Mateusz Nędzi'
tags: ['module', 'sim', 'domain', 'facility']
links:
  parent: '../../SUMMARY.md'
  siblings: ['./depot.md', './gas-station.md', './site.md', './node.md']
---

# Building

> **Purpose:** Provide the skeletal representation of any structure that can host trucks at a node, allowing specialised facilities to compose over a consistent API.

## Context & Motivation

- Logistics locations share common needs: a node anchor and a list of present trucks. Centralising these rules prevents duplication across depots, sites, and gas stations.

## Responsibilities & Boundaries

- In-scope: node association, truck membership management, basic predicates.
- Out-of-scope: inventory (depots/sites) or service capacities (gas stations); subclasses add those concerns.

## Architecture & Design

- Constructor accepts plain DTOs but wraps trucks in a `Set`.
- Mutators (`addTruck`, `removeTruck`) return new `Building` instances, supporting deterministic snapshots.

## References

- [Depot](./depot.md)
- [Site](./site.md)
- [Gas Station](./gas-station.md)
