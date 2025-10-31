---
title: 'Domain Type Aliases'
summary: 'Documents shared aliases and identifiers that guarantee consistent typing across simulation entities.'
source_paths:
  - 'src/sim/domain/types.ts'
last_updated: '2025-10-31'
owner: 'Mateusz Nędzi'
tags: ['module', 'sim', 'domain', 'types']
links:
  parent: '../../SUMMARY.md'
  siblings:
    [
      './index.md',
      './node.md',
      './building.md',
      './package.md',
      './truck.md',
    ]
---

# Domain Type Aliases

> **Purpose:** Provide canonical string-based identifier aliases (e.g., `NodeId`, `TruckId`) and convenience helpers shared by all simulation classes.

## Context & Motivation

- Simplifies generics when building maps in the store and selectors by grounding IDs in a common namespace.
- Keeps DTO adapters honest by reusing the same alias names used within domain constructors.

## Responsibilities & Boundaries

- In-scope: alias definitions, simple helper factories such as `uuid()` to document intent.
- Out-of-scope: validation or UUID generation; call sites remain responsible for ensuring uniqueness.

## References

- [Simulation Domain Models](./index.md)
- [Simulation State Helpers](../state.md)

