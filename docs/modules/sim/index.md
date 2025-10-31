---
title: 'Simulation Layer Overview'
summary: 'Explains the role of the simulation layer as the pure domain core that captures map topology, movable agents, and package logistics without touching rendering or networking concerns.'
source_paths:
  - 'src/sim/index.ts'
last_updated: '2025-10-31'
owner: 'Mateusz Nędzi'
tags: ['module', 'sim']
links:
  parent: '../../SUMMARY.md'
  siblings:
    [
      './domain/index.md',
      './state.md',
      './store/index.md',
      './systems/index.md',
      './adapters/index.md',
      './selectors/index.md',
    ]
---

# Simulation Layer Overview

> **Purpose:** Provide a cohesive export surface for the simulation domain so higher layers can assemble and query world state without being coupled to implementation details.

## Context & Motivation

- Problem solved: centralise domain logic for routing, transport assets, and packages while staying independent of IO and rendering.
- Requirements: pure TypeScript, immutable snapshots, SOLID-friendly class decomposition, compatibility with low-latency updates from the network layer.
- Dependencies: foundational types from `domain/*`, structural helpers in `state.ts`, orchestration utilities in `store/`, and adapter/system pipelines.

## Responsibilities & Boundaries

- In-scope: re-export domain classes, selectors, stores, adapters, and system pipelines that together represent the simulation core.
- Out-of-scope: WebSocket IO, three.js view mutations, React HUD rendering; those layers import this surface but never mutate domain objects directly.

## Architecture & Design

- `src/sim/index.ts` is a barrel that forwards curated exports from subpackages, avoiding circular imports and clarifying intended extension points.
- Composition layers (e.g., `main.ts`) import from this module when wiring the app, ensuring dependency inversion between IO/view and domain logic.
- Tree mirrors the clean IO → Domain → View separation: each subfolder isolates responsibilities for maintainability.

## References

- [Domain Models](./domain/index.md)
- [Simulation State Helpers](./state.md)
- [Store & Buffer](./store/index.md)
- [System Pipelines](./systems/index.md)
- [Network/View Adapters](./adapters/index.md)
- [Selectors](./selectors/index.md)

