---
title: 'Scene Manager'
summary: 'Initializes the shared THREE.Scene with warm-world lighting, fog, and ground plane scaffolding for downstream view modules.'
source_paths:
  - 'src/engine/scene-manager.ts'
last_updated: '2025-11-09'
owner: 'Mateusz Nędzi'
tags: ['module', 'engine', 'scene']
links:
  parent: '../index.md'
  siblings:
    - 'engine.md'
    - 'camera-rig.md'
    - 'controls/orbit-move-controls.md'
    - 'objects/ground.md'
    - 'objects/node.md'
    - 'objects/road.md'
---

# Scene Manager

> Purpose: Provide a preconfigured `THREE.Scene` with lighting and ground consistent with the Low-Poly Warm World style. Consumers receive an already-styled scene to attach their view objects.

## Context & Motivation

- Problem solved: avoids duplicating lighting/fog setup across views.
- Requirements and constraints:
  - Warm ambient light, sunset key light, and subtle fog for depth cues.
  - Ground plane sized for world scale, using reusable object factory.
- Dependencies and assumptions:
  - Uses `Colors` palette for lighting/fog colors.
  - Imports `createGround` from `engine/objects/ground`.

## Responsibilities & Boundaries

- In-scope:
  - Instantiate `THREE.Scene` and attach lights/ground.
  - Provide `scene` property for external rendering.
- Out-of-scope:
  - Dynamic object management (handled by view modules).

## Architecture & Design

- Scene background and fog share warm cream tones to maintain cohesive palette.
- Adds ambient + point lights; point light positioned diagonally to mimic evening sun.
- Ground area default 500×500; sized for early prototypes.

## Algorithms & Complexity

- One-time constructor work; no per-frame logic.

## Public API / Usage

```start:SceneManager:src/engine/scene-manager.ts
const scenes = new SceneManager();
const scene = scenes.scene;
```

## Implementation Notes

- Fog range (60→100) keeps foreground crisp while fading distant geometry.
- Lighting uses high roughness to avoid harsh specular highlights.

## References

- `docs/style-guide.md`
- `src/engine/objects/ground.ts`
- `src/app/colors.ts`
