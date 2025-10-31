---
title: 'Advance Pipeline'
summary: 'Defines the composable pipeline that applies pure systems to evolve simulation state each tick.'
source_paths:
  - 'src/sim/systems/advance.ts'
last_updated: '2025-10-31'
owner: 'Mateusz Nędzi'
tags: ['module', 'sim', 'systems']
links:
  parent: '../../SUMMARY.md'
  siblings:
    ['./index.md', '../store/simulation-store.md']
---

# Advance Pipeline

> **Purpose:** Provide functional composition helpers that execute a list of pure systems over a `SimulationState` given frame timing metadata.

## Context & Motivation

- The simulation must remain deterministic and testable. Combinators (`composeSystems`, `advanceSimulation`) make it easy to assemble ordered system lists.

## Responsibilities & Boundaries

- In-scope: defining the `SimulationSystem` signature, pure composition, and a `noopSystem` for scaffolding.
- Out-of-scope: actual physics, routing, or logistics logic; those arrive as individual systems later on.

## Implementation Notes

- Composition uses `Array.prototype.reduce`, ensuring left-to-right system execution.
- When no systems are provided, `advanceSimulation` returns the input state unchanged, making bootstrapping cheap.

## References

- [Simulation Store](../store/simulation-store.md)
- [Simulation Domain](../domain/index.md)

