---
title: 'Site'
summary: 'Captures delivery or pickup locations that host packages awaiting assignment to trucks.'
source_paths:
  - 'src/sim/domain/site.ts'
last_updated: '2025-10-31'
owner: 'Mateusz Nędzi'
tags: ['module', 'sim', 'domain', 'facility']
links:
  parent: '../../SUMMARY.md'
  siblings:
    ['./building.md', './package.md', './depot.md']
---

# Site

> **Purpose:** Represent customer or intermediate stops where packages await collection or drop-off, wrapping shared building behaviour.

## Context & Motivation

- Each site tracks its package IDs so selectors and systems can compute outstanding deliveries quickly.

## Responsibilities & Boundaries

- In-scope: storing package membership, immutable helpers for adding/removing packages.
- Out-of-scope: route assignment or SLA tracking.

## References

- [Packages](./package.md)
- [Building Base](./building.md)

