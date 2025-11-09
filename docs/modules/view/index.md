---
title: "View Layer Controller"
summary: "Coordinates three.js scene mutations based on simulation snapshots, delegating rendering work to feature-specific view modules such as the graph visualizer."
source_paths:
  - "src/view/index.ts"
last_updated: "2025-11-09"
owner: "Mateusz Nędzi"
tags: ["module", "view", "engine"]
links:
  parent: "../../SUMMARY.md"
  siblings:
    - "graph/graph-view.md"
---

# View Layer

> Purpose: Provide a thin orchestration layer that pulls interpolated simulation frames and applies them to the three.js scene exclusively through view submodules. The controller enforces IO → Domain → View separation by keeping simulation data immutable and constraining side-effects to `view/*`.

## Context & Motivation

- Problem solved: bridge between buffered simulation snapshots and three.js renders.
- Requirements and constraints:
  - Consume `SimStore` buffers without mutating snapshots.
  - Keep rendering code isolated from domain logic.
  - Remain extensible for additional scene components beyond the graph.
- Dependencies and assumptions:
  - `SimStore` exposes a monotonic `SnapshotBuffer`.
  - The engine render loop provides `renderTimeMs` aligned with `performance.now()`.

## Responsibilities & Boundaries

- In-scope:
  - Compute interpolated frames (`interpolateSnapshots`) and dispatch them to subviews.
  - Manage lifecycle of scene subtrees (creation, updates, disposal).
- Out-of-scope:
  - Simulation updates or reducer logic.
  - HUD composition or DOM rendering.
  - Low-level engine configuration (renderer, camera, controls).

## Architecture & Design

- Key classes:
  - `createViewController(options)` returns a `ViewController` with `update` and `dispose` hooks.
  - `GraphView` (documented separately) handles node/road meshes.
- Data flow:
  - Engine loop calls `view.update(renderTimeMs)`.
  - View controller queries `SnapshotBuffer.getBracketing(renderTimeMs)` and produces a `SimFrame`.
  - Subviews receive the frame to mutate their three.js objects.
- State management:
  - No internal mutable state beyond cached subview instances.
  - Snapshots remain frozen; subviews treat them as read-only.
- Resource handling:
  - Subviews own their three.js objects and expose `dispose()` for cleanup.

## Algorithms & Complexity

- Interpolation is O(1) per frame using buffered snapshots.
- Dispatch to subviews is O(n) where n is number of registered subviews (currently 1).

## Public API / Usage

- `createViewController({ store, scene })` → `ViewController` with methods:
  - `update(renderTimeMs: number): void`
  - `dispose(): void`

## Implementation Notes

- Relies on `SimStore.getBuffer()` for interpolation-ready history.
- Designed so additional subviews can be registered without modifying the controller (composition over inheritance).

## Tests (If Applicable)

- Manual verification via the running app (renders graph nodes/roads).
- Future unit tests should mock `SnapshotBuffer` to cover interpolation edge cases.

## Performance

- Single allocation per frame (`SimFrame`); subviews should cache geometries/materials to avoid GC pressure.

## Security & Reliability

- Controller trusts `SnapshotBuffer` ordering; upstream validation occurs in `SimStore`.
- No IO; errors within subviews should be caught to avoid breaking the render loop.

## References

- `src/main.ts` (integration entry point)
- `src/view/graph/graph-view.ts`
- `src/sim/store/snapshot-buffer.ts`
