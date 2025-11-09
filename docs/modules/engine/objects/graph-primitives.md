---
title: 'Graph Primitives'
summary: 'Reusable factories for node meshes and road lines ensuring consistent geometry, elevation, and warm palette usage across graph visualizations.'
source_paths:
  - 'src/engine/objects/graph-primitives.ts'
last_updated: '2025-11-09'
owner: 'Mateusz Nędzi'
tags: ['module', 'engine', 'objects', 'graph']
links:
  parent: '../../index.md'
  siblings:
    - '../engine.md'
    - '../scene-manager.md'
    - '../camera-rig.md'
    - '../controls/orbit-move-controls.md'
    - 'ground.md'
---

# Graph Primitives

> Purpose: Centralize creation of three.js objects used to visualize the logistics graph. Guarantees node cylinders and road lines share geometry proportions, colors, and shading across all views.

## Context & Motivation

- Problem solved: eliminates duplicate geometry/material code in view modules like `GraphView`.
- Requirements and constraints:
  - Keep warm palette adherence (`Colors.graphNode`, `Colors.graphRoad`).
  - Maintain low-poly faceting (12 radial segments) and gentle elevation above ground.
- Dependencies and assumptions:
  - Used primarily by `src/view/graph/graph-view.ts`.
  - Colors provided by `app/colors`.

## Responsibilities & Boundaries

- In-scope:
  - Export constants for node dimensions and road elevation.
  - Provide `createGraphNodeMesh()` and `createGraphRoadLine()` factories.
- Out-of-scope:
  - Positioning or animation of nodes/roads (handled by view layer).

## Architecture & Design

- Mesh factory clones a cylinder geometry rotated onto XZ plane, matching warm-world style.
- Line factory pre-allocates 2-point buffer attribute updated per frame by views.

## Algorithms & Complexity

- O(1) creation per object; no per-frame logic.

## Public API / Usage

```start:createGraphNodeMesh:src/engine/objects/graph-primitives.ts
const nodeMesh = createGraphNodeMesh();
nodeMesh.position.set(x, GRAPH_ROAD_ELEVATION + GRAPH_NODE_HEIGHT / 2, z);
```

## Implementation Notes

- Factories disable shadows for nodes/roads to reduce render cost until we introduce stylized shading.
- Consumers must dispose geometry/material when removing instances to avoid GPU leaks.

## References

- `src/view/graph/graph-view.ts`
- `src/app/colors.ts`
- `docs/style-guide.md`
