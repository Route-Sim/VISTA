---
title: 'Graph Transform'
summary: 'Computes centering and scaling factors for simulation graph coordinates so view objects render around the origin at a normalized scale.'
source_paths:
  - 'src/view/graph/graph-transform.ts'
last_updated: '2025-11-09'
owner: 'Mateusz Nędzi'
tags: ['module', 'view', 'graph']
links:
  parent: '../../../SUMMARY.md'
  siblings:
    - 'graph-view.md'
---

# Graph Transform

> Purpose: Provide a reusable normalization step that recenters the logistics graph at the world origin and scales coordinates by a constant factor (0.1) before rendering. This ensures consistent scene framing regardless of incoming map dimensions.

## Context & Motivation

- Problem solved: simulation coordinates can be large or offset; normalization keeps the visual origin stable and manageable for camera controls.
- Requirements and constraints:
  - Maintain pure functions (no three.js dependencies) for reuse by future view modules.
  - Default scale factor of ×0.1 (downscaling by ten) applied uniformly.
- Dependencies and assumptions:
  - Operates on `SimSnapshot` data; expects nodes to define planar `x/y` positions.

## Responsibilities & Boundaries

- In-scope:
  - Compute bounding-box center across all nodes.
  - Expose scale alongside center for downstream modules.
  - Provide helper to normalize arbitrary points.
- Out-of-scope:
  - Runtime caching or memoization (handled by consumers if needed).
  - 3D vector manipulation (left to view layer objects).

## Architecture & Design

- `computeGraphTransform(snapshot)` iterates nodes once (O(n)) to determine center.
- `normalizePoint(x, y, transform)` applies the computed offset + scale, returning normalized coordinates suitable for XZ plane placement.

## Algorithms & Complexity

- Single pass across node list → O(n) time, O(1) space.
- Gracefully falls back to origin-centered transform when no nodes exist.

## Public API / Usage

```start:computeGraphTransform:src/view/graph/graph-transform.ts
const transform = computeGraphTransform(snapshot);
const { x, y } = normalizePoint(node.x, node.y, transform);
```

## Implementation Notes

- Bounding-box center provides a stable visual anchor even for non-convex graphs; alternative strategies (e.g., centroid weighting) can be added later.
- Exposed `GRAPH_POSITION_SCALE` constant makes it easy to align normalization across additional view systems (agents, buildings, etc.).

## References

- `src/view/graph/graph-view.ts`
- `docs/modules/view/index.md`
- `docs/style-guide.md`
