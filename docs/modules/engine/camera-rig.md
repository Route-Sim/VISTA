---
title: 'Camera Rig'
summary: 'Factory for a perspective camera tuned to the scene scale with responsive aspect ratio handling for window resizes.'
source_paths:
  - 'src/engine/camera-rig.ts'
last_updated: '2025-11-09'
owner: 'Mateusz Nędzi'
tags: ['module', 'engine', 'camera']
links:
  parent: '../index.md'
  siblings:
    - 'engine.md'
    - 'scene-manager.md'
    - 'controls/orbit-move-controls.md'
    - 'objects/ground.md'
    - 'objects/graph-primitives.md'
---

# Camera Rig

> Purpose: Provide a ready-to-use `THREE.PerspectiveCamera` configured for the world scale and automatically responsive to canvas/window resizes.

## Context & Motivation

- Problem solved: centralizes camera settings to keep `main` minimal and consistent across usages.
- Requirements and constraints:
  - 75° FOV with near/far planes tuned for warm-world scale.
  - Maintain aspect ratio updates when canvas size changes.
- Dependencies and assumptions:
  - Expects an HTMLCanvasElement already attached to DOM.

## Responsibilities & Boundaries

- In-scope:
  - Instantiate camera with default position `(0, 15, 15)`.
  - Attach resize handler adjusting aspect and projection matrix.
- Out-of-scope:
  - Input controls (handled by `orbit-move-controls`).
  - Scene graph updates.

## Architecture & Design

- Uses `canvas.clientWidth/Height` fallback to `window.innerWidth/Height` for SSR-safe measurement.
- Keeps handler reference inside closure; no explicit dispose yet (future improvement for teardown).

## Algorithms & Complexity

- Resize handler O(1); triggered by window events.

## Public API / Usage

```start:createCamera:src/engine/camera-rig.ts
const camera = createCamera(canvas);
```

## Implementation Notes

- Camera positioned to look down at origin; orbit controls retarget the look-at center.
- Consumers should remove resize listener during teardown if necessary.

## References

- `src/engine/controls/orbit-move-controls.ts`
- `src/main.ts`
