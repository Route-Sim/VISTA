---
title: 'Simulation Adapters Overview'
summary: 'Explains boundary adapters that convert between network DTOs and domain objects, and from domain snapshots to view models.'
source_paths:
  - 'src/sim/adapters/index.ts'
last_updated: '2025-10-31'
owner: 'Mateusz Nędzi'
tags: ['module', 'sim', 'adapters']
links:
  parent: '../../SUMMARY.md'
  siblings:
    ['./from-network.md', './to-view.md']
---

# Simulation Adapters Overview

> **Purpose:** Centralise translation logic at the simulation boundaries, keeping the domain pure and serialisable.

## Context & Motivation

- Incoming WebSocket signals are decoded in `net/` and then shaped through `from-network`. The view consumes data produced by `to-view`.

## References

- [From Network](./from-network.md)
- [To View](./to-view.md)

