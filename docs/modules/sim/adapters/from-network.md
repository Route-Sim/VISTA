---
title: 'From Network Adapter'
summary: 'Pure converters that turn validated wire DTOs into domain classes and apply them onto a `SimulationState` instance.'
source_paths:
  - 'src/sim/adapters/from-network.ts'
last_updated: '2025-10-31'
owner: 'Mateusz Nędzi'
tags: ['module', 'sim', 'adapters', 'net']
links:
  parent: '../../SUMMARY.md'
  siblings: ['./to-view.md', '../store/simulation-state.md']
---

# From Network Adapter

> **Purpose:** Map network payloads (already validated by `net/protocol`) into rich domain objects while preserving immutability.

## Context & Motivation

- The network layer emits DTOs that may use snake_case naming. These helpers decouple that representation from internal classes.

## Responsibilities & Boundaries

- In-scope: converter functions per entity (`nodeFromDto`, `truckFromDto`) and `applySimulationStateDto` for bulk application.
- Out-of-scope: decoding raw WebSocket data—that work finishes before these adapters run.

## Implementation Notes

- DTO interfaces live locally to avoid a compile-time dependency on zod schemas while still documenting expected shapes.
- `applySimulationStateDto` composes `with*` builders on `SimulationState`, enabling incremental merges.

## References

- [SimulationState](../store/simulation-state.md)
- [Network Protocol Schema](../../net/protocol/schema.md)
