---
title: "Road"
summary: "Factory for graph road meshes and constants, ensuring consistent lane width, elevation, and road classification colors."
source_paths:
  - "src/engine/objects/road.ts"
last_updated: "2025-11-23"
owner: "Mateusz Nędzi"
tags: ["module", "engine", "objects", "graph", "road"]
links:
  parent: "../../index.md"
  siblings:
    - "../engine.md"
    - "../scene-manager.md"
    - "node.md"
    - "ground.md"
---

# Road

> **Purpose:** Centralize creation of three.js objects used to visualize graph roads. Manages road dimensions, classification colors, and shared geometries.

## Context & Motivation

- Problem solved: eliminates duplicate geometry/material code in view modules like `GraphView`.
- Requirements and constraints:
  - Support multiple road classes with distinct colors (`A`, `S`, `GP`, etc.).
  - Maintain low-poly aesthetics (flat shading).
  - Standardize lane width and road thickness (constant width for all roads).
- Dependencies and assumptions:
  - Used primarily by `src/view/graph/graph-view.ts`.
  - Colors provided by `app/colors`.

## Responsibilities & Boundaries

- In-scope:
  - Export constants for road dimensions (`LANE_WIDTH_METERS`, `ROAD_THICKNESS`) and elevation (`GRAPH_ROAD_ELEVATION`).
  - Provide `createRoadMesh(roadClass)` factory.
  - Provide `getRoadColor(roadClass)` helper.
- Out-of-scope:
  - Positioning, scaling, and orientation of roads (handled by view layer).

## Architecture & Design

- Uses a shared `BoxGeometry` (1x1x1) which is scaled by the view layer to match road length and width.
- `createRoadMesh` applies a `MeshStandardMaterial` based on the road class color.

## Algorithms & Complexity

- O(1) creation per object.
- Geometry sharing reduces memory overhead.

## Public API / Usage

```ts
import { createRoadMesh, getRoadColor } from "@/engine/objects/road";

const roadMesh = createRoadMesh('A');
// View layer scales the mesh:
// mesh.scale.set(width, thickness, length);
```

## Implementation Notes

- Casts and receives shadows by default.
- Shared geometry means consumers should NOT dispose the geometry, only the material.

## References

- `src/view/graph/graph-view.ts`
- `src/app/colors.ts`
- `docs/style-guide.md`

