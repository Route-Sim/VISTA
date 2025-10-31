---
title: 'Simulation Domain Models'
summary: 'Describes the core class set representing nodes, roads, buildings, vehicles, agents, and packages that make up the logistics world state.'
source_paths:
  - 'src/sim/domain/index.ts'
  - 'src/sim/domain/types.ts'
last_updated: '2025-10-31'
owner: 'Mateusz Nędzi'
tags: ['module', 'sim', 'domain']
links:
  parent: '../../SUMMARY.md'
  siblings:
    [
      './node.md',
      './edge.md',
      './road.md',
      './building.md',
      './depot.md',
      './gas-station.md',
      './site.md',
      './package.md',
      './truck.md',
      './agent.md',
      './types.md',
    ]
---

# Simulation Domain Models

> **Purpose:** Establish a type-safe, object-oriented representation of the transport network so higher layers manipulate logistics concepts without leaking infrastructure details.

## Context & Motivation

- Problem solved: encode topology, capacities, and ownership rules in cohesive classes instead of scattered data structures.
- Requirements: immutability-by-construction, small well-defined APIs per class, pure TypeScript with no view or network dependencies.
- Dependencies: basic aliases in `types.ts`; downstream consumers include stores, systems, and adapters.

## Responsibilities & Boundaries

- In-scope: domain invariants (e.g., unique IDs, per-entity membership lists, helper predicates) and behaviour that mutates state by returning new instances.
- Out-of-scope: persistence, event timing, visualization; these concern other layers.

## Architecture & Design

- Each entity lives in its own file, enabling SOLID-aligned single-responsibility classes.
- Constructors accept DTO-like params but immediately wrap collections with `Set` instances to guarantee uniqueness.
- Methods follow an immutable pattern: they either read state or return fresh instances with changes applied.

## References

- [Node](./node.md)
- [Road](./road.md)
- [Building Hierarchy](./building.md)
- [Package](./package.md)
- [Truck](./truck.md)
- [Agent](./agent.md)

