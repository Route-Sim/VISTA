---
title: 'Simulation Selectors'
summary: 'Catalogues pure query helpers for retrieving domain objects from immutable snapshots without leaking map internals.'
source_paths:
  - 'src/sim/selectors/index.ts'
last_updated: '2025-10-31'
owner: 'Mateusz Nędzi'
tags: ['module', 'sim', 'selectors']
links:
  parent: '../../SUMMARY.md'
  siblings:
    ['./../state.md', './../store/index.md']
---

# Simulation Selectors

> **Purpose:** Offer read-only accessors that hide collection shapes and reduce repeated lookup boilerplate for view or HUD layers.

## Context & Motivation

- The store exposes maps keyed by IDs. Selectors wrap them, returning domain objects or derived arrays while respecting immutability.

## Responsibilities & Boundaries

- In-scope: ID-based lookups (`selectNode`, `selectTruck`), collection helpers (`listTrucksByBuilding`, `listPackagesOnTruck`).
- Out-of-scope: mutation, caching, side effects.

## Implementation Notes

- Functions immediately bail out when an entity is missing, returning empty arrays to simplify consumer logic.
- Derived lists use type guards to filter `undefined` results, preserving static typing.

## References

- [Simulation State Helpers](../state.md)
- [Simulation Store](../store/simulation-store.md)

