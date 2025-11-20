---
title: 'Tree Object'
summary: 'Procedural low-poly tree generator with randomized foliage and height.'
source_paths:
  - 'src/engine/objects/tree.ts'
last_updated: '2025-11-20'
owner: 'Mateusz Nędzi'
tags: ['engine', 'objects', 'procedural', 'three.js']
links:
  parent: '../../scene-manager.md'
  siblings:
    - 'ground.md'
    - 'truck.md'
---

# Tree Object

> **Purpose:** Provides a factory function to generate varied, low-poly tree meshes for the scene environment.

## Context & Motivation

To populate the world with "Low-Poly Warm World" aesthetics, we need organic shapes that feel consistent with the faceted, rounded style. Procedural generation allows us to place many trees without them looking like identical clones.

## Responsibilities & Boundaries

- **In-scope:**
  - Generating a `THREE.Group` containing a trunk and foliage meshes.
  - Applying random variations to height, scale, and clump arrangement.
  - Assigning shared materials for performance.
- **Out-of-scope:**
  - LOD (Level of Detail) management.
  - Wind animation (handled by view-layer systems if needed, though the mesh structure supports it).

## Architecture & Design

- **Primitives:**
  - Trunk: `CylinderGeometry` (low radial segments).
  - Foliage: `IcosahedronGeometry` (approximation of a low-poly sphere).
- **Materials:**
  - `MeshStandardMaterial` with `flatShading: true` to emphasize the low-poly look.
  - Colors pulled from `src/app/colors.ts` (`treeTrunk`, `treeFoliage`).

## Public API

```ts
import { createTree } from '@/engine/objects/tree';

const tree = createTree({
  height: 3.5,        // Optional override
  foliageScale: 1.2,  // Optional override
});
scene.add(tree);
```

## Implementation Notes

- **Randomness:** We stack 2-3 foliage clumps vertically with random offsets to create an irregular silhouette.
- **Performance:** Geometries are shared where possible, but currently, each tree creates new meshes. For massive forests, we should move to `InstancedMesh`.

## References

- [Style Guide](../../../../style-guide.md)
- [Colors](../../app/colors.md)
