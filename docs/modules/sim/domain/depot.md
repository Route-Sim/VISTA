---
title: 'Depot'
summary: 'Specialises buildings with capacity-limited package storage for fleet origin hubs.'
source_paths:
  - 'src/sim/domain/depot.ts'
last_updated: '2025-10-31'
owner: 'Mateusz Nędzi'
tags: ['module', 'sim', 'domain', 'facility']
links:
  parent: '../../SUMMARY.md'
  siblings: ['./building.md', './site.md', './package.md']
---

# Depot

> **Purpose:** Manage package intake and dispatch capacity while inheriting docking behaviour from `Building`.

## Context & Motivation

- Depots cap the number of packages staged at a node; downstream systems use `canAccept()` before scheduling deliveries.

## Responsibilities & Boundaries

- In-scope: storage capacity, package membership helpers, immutable add/remove operations.
- Out-of-scope: routing decisions, package lifecycle orchestration.

## Algorithms & Complexity

- `canAccept()` compares the tracked package count with declared capacity, running in O(1).

## References

- [Packages](./package.md)
- [Simulation State Helpers](../state.md)
