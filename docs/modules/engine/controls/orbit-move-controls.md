---
title: 'Orbit Move Controls'
summary: 'Hybrid orbit/flight controller layering keyboard translation over Three.js OrbitControls for navigating the warm-world scene.'
source_paths:
  - 'src/engine/controls/orbit-move-controls.ts'
last_updated: '2025-11-23'
owner: 'Mateusz Nędzi'
tags: ['module', 'engine', 'controls']
links:
  parent: '../../index.md'
  siblings:
    - '../engine.md'
    - '../scene-manager.md'
    - '../camera-rig.md'
    - '../objects/ground.md'
    - '../objects/node.md'
    - '../objects/road.md'
---

# Orbit Move Controls

> Purpose: Combine mouse-driven orbiting with WASD + vertical translation for intuitive navigation of the logistics scene. Wraps three.js `OrbitControls` and augments it with keyboard input.

## Context & Motivation

- Problem solved: default OrbitControls lack keyboard panning; this module adds smooth flight-style movement tailored to our scene scale.
- Requirements and constraints:
  - Maintain gentle damping and rotation to respect the cozy aesthetic.
  - Enforce minimum Y altitude to keep camera above ground plane.
- Dependencies and assumptions:
  - Requires `OrbitControls` from three.js examples bundle.
  - Consumes `PerspectiveCamera` and canvas element from engine bootstrap.

## Responsibilities & Boundaries

- In-scope:
  - Instantiate OrbitControls with warm-world tuned speeds.
  - Track keyboard state and translate camera + target each frame.
- Out-of-scope:
  - Collision detection or terrain following (future enhancements).

## Architecture & Design

- Returns lightweight `{ update(deltaSeconds) }` interface for engine loop integration.
- Stores key state in simple object keyed by lowercase codes to support WASD and arrow keys.
- Uses vector math to derive horizontal forward/right vectors while keeping camera upright.

## Algorithms & Complexity

- Per-frame `update` operations are O(1) with constant vector math.
- Keyboard handlers update state in O(1) per event.

## Public API / Usage

```start:createOrbitMoveControls:src/engine/controls/orbit-move-controls.ts
const controls = createOrbitMoveControls(camera, canvas, {
  movementSpeed: 8,
  minY: 5,
});
engine.onUpdate((t) => controls.update(t.deltaTimeMs / 1000));
```

## Implementation Notes

- Movement speed defaults to 6 units/sec; options allow tuning.
- `minY` prevents camera dipping below ground. Clamping is synchronized between camera and orbit target to preserve look-at rotation when hitting the floor.
- Keyboard listeners attached to `window`; teardown should remove them when controls are disposed (future todo).

## References

- `src/engine/camera-rig.ts`
- `src/main.ts`
