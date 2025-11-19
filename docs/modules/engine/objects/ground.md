---
title: 'Ground Object'
summary: 'Factory for the warm-ground plane mesh used as the scene base, exposing configurable size and color parameters.'
source_paths:
  - 'src/engine/objects/ground.ts'
last_updated: '2025-11-09'
owner: 'Mateusz Nędzi'
tags: ['module', 'engine', 'objects']
links:
  parent: '../../index.md'
  siblings:
    - '../engine.md'
    - '../scene-manager.md'
    - '../camera-rig.md'
    - '../controls/orbit-move-controls.md'
    - 'node.md'
    - 'road.md'
---

# Ground Object

> Purpose: Provide a reusable ground plane mesh aligned with the Low-Poly Warm World palette. Keeps ground creation consistent across scenes and tests.

## Context & Motivation

- Problem solved: avoids duplicating plane geometry/material setup in different scenes or prototypes.
- Requirements and constraints:
  - Flat-shaded MeshStandardMaterial with high roughness and zero metalness.
  - Default size wide enough for navigation while staying configurable.
- Dependencies and assumptions:
  - Uses `Colors.ground` for default tint.

## Responsibilities & Boundaries

- In-scope:
  - Create `THREE.Mesh` with plane geometry and rotate to lie on XZ plane.
  - Allow overrides for width, height, color, and shadow reception.
- Out-of-scope:
  - Terrain variation or textures; higher-level systems can replace this with instanced tiles.

## Architecture & Design

- Plane geometry resolution kept at 1×1 segments to maintain low-poly faceting.
- Returns mesh with `receiveShadow` configurable (default true).

## Algorithms & Complexity

- One-time creation; no per-frame work.

## Public API / Usage

```start:createGround:src/engine/objects/ground.ts
const ground = createGround({ width: 500, height: 500 });
scene.add(ground);
```

## Implementation Notes

- Mesh kept at `y = 0` but can be offset if water planes or multi-layer scenes are introduced.
- Clients should dispose geometry/material during teardown if ground is removed dynamically.

## References

- `src/app/colors.ts`
- `docs/style-guide.md`
- `src/engine/scene-manager.ts`
