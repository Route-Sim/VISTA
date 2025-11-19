---
title: "Node"
summary: "Factory for graph node meshes, ensuring consistent geometry, dimensions, and warm palette usage."
source_paths:
  - "src/engine/objects/node.ts"
last_updated: "2025-11-19"
owner: "Mateusz Nędzi"
tags: ["module", "engine", "objects", "graph", "node"]
links:
  parent: "../../index.md"
  siblings:
    - "../engine.md"
    - "../scene-manager.md"
    - "road.md"
    - "ground.md"
---

# Node

> **Purpose:** Centralize creation of three.js objects used to visualize graph nodes (destinations/intersections). Nodes are visualized as gray squares capable of hosting buildings.

## Context & Motivation

- Problem solved: eliminates duplicate geometry/material code in view modules like `GraphView`.
- Requirements and constraints:
  - Keep warm palette adherence (`Colors.graphNode` - now gray).
  - Represent nodes as platforms (squares) rather than simple points.
- Dependencies and assumptions:
  - Used primarily by `src/view/graph/graph-view.ts`.
  - Colors provided by `app/colors`.

## Responsibilities & Boundaries

- In-scope:
  - Export constants for node dimensions (`GRAPH_NODE_SIZE`, `GRAPH_NODE_HEIGHT`).
  - Provide `createGraphNodeMesh()` factory.
- Out-of-scope:
  - Positioning or animation of nodes (handled by view layer).

## Architecture & Design

- Mesh factory creates a `BoxGeometry` (square base), matching warm-world style.
- Uses `MeshStandardMaterial` with specific roughness/metalness settings.
- Size is set to accommodate future building slots.

## Algorithms & Complexity

- O(1) creation per object; no per-frame logic.

## Public API / Usage

```ts
import { createGraphNodeMesh, GRAPH_NODE_HEIGHT } from "@/engine/objects/node";

const nodeMesh = createGraphNodeMesh();
// Position logic is typically handled by view, e.g.:
// nodeMesh.position.set(x, y + GRAPH_NODE_HEIGHT / 2, z);
```

## Implementation Notes

- Nodes cast and receive shadows.
- Consumers must dispose geometry/material when removing instances.

## References

- `src/view/graph/graph-view.ts`
- `src/app/colors.ts`
- `docs/style-guide.md`
