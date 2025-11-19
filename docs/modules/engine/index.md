---
title: 'Engine Module Overview'
summary: 'Three.js engine bootstrapping layer that initializes renderer, scene, camera rig, controls, and reusable objects while keeping rendering concerns separate from simulation.'
source_paths:
  - 'src/engine'
last_updated: '2025-11-09'
owner: 'Mateusz Nędzi'
tags: ['module', 'engine', 'architecture']
links:
  parent: '../../SUMMARY.md'
  siblings:
    - 'engine.md'
    - 'scene-manager.md'
    - 'camera-rig.md'
    - 'controls/orbit-move-controls.md'
    - 'objects/ground.md'
    - 'objects/node.md'
    - 'objects/road.md'
---

# Engine Module Overview

> Purpose: Provide platform-specific rendering infrastructure. The engine manages WebGL renderer lifecycle, shared scene setup, camera rigging, controls, and reusable three.js assets. It exposes a clean surface so `src/main.ts` can compose rendering with simulation and HUD without leaking three.js details elsewhere.

## Context & Motivation

- Problem solved: centralize three.js setup and reusable objects to avoid duplication in view modules.
- Requirements and constraints:
  - Respect IO → Domain → View separation; no simulation logic here.
  - Keep render loop deterministic and observable via hooks.
  - Reuse warm-world aesthetics via shared objects/colors.
- Dependencies and assumptions:
  - `app/colors` supplies palette.
  - View modules (e.g., `GraphView`) receive `THREE.Scene` constructed here.

## Responsibilities & Boundaries

- In-scope:
  - Renderer lifecycle and RAF loop (`engine.ts`).
  - Scene creation with lighting/ground (`scene-manager.ts`).
  - Camera configuration and orbital controls.
  - Reusable meshes/lines under `engine/objects`.
- Out-of-scope:
  - Domain state or network IO.
  - HUD (handled in `src/hud`).
  - Per-frame scene mutations (delegated to `view/*`).

## Architecture & Design

- `Engine` wraps `THREE.WebGLRenderer` and exposes `onUpdate` for subscribers.
- `SceneManager` seeds base ambient lighting, directional points, and ground plane.
- `camera-rig` creates perspective camera sized to canvas; controls module adds orbital movement + WASD translation.
- Objects directory hosts factory functions for primitives (ground, graph nodes/roads) to keep style consistent.

## Algorithms & Complexity

- Render loop per frame: O(n) over registered callbacks, typically small.
- Controls maintain minimal state for keyboard handling.

## Public API / Usage

- `new Engine(canvas)` → exposes `gl` and `onUpdate`.
- `new SceneManager()` → provides `scene` property.
- `createCamera(canvas)` and `createOrbitMoveControls(camera, canvas, opts)` used during bootstrap.
- `createGround`, `createGraphNodeMesh`, `createGraphRoadLine` reused by view modules.

## Implementation Notes

- Engine uses `requestAnimationFrame`; subscribers should be idempotent and performant.
- Scene uses warm ambient/point lights aligned with style guide; fog configured for depth cues.
- Controls add keyboard flight-style translation layered atop orbit camera.

## References

- `src/main.ts`
- `docs/style-guide.md`
- `docs/modules/view/index.md`
