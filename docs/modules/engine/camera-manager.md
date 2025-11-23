---
title: 'Camera Manager'
summary: 'Manages the dual-mode camera system, switching between free-roam and focused object tracking.'
source_paths:
  - 'src/engine/camera-manager.ts'
last_updated: '2025-11-23'
owner: 'Mateusz Nędzi'
tags: ['engine', 'camera', 'controls', 'focus']
links:
  parent: '../../SUMMARY.md'
  siblings:
    - 'controls/orbit-move-controls.md'
    - '../hud/state/focus-state.md'
---

# Camera Manager

> **Purpose:** Orchestrates the camera behavior, toggling between user-controlled free movement and automated object tracking based on the global focus state.

## Context & Motivation

- **Problem:** We need two distinct camera behaviors:
  1.  **Free Mode:** User moves freely with WASD + Orbit (default).
  2.  **Focused Mode:** Camera locks onto a specific object (agent, building, etc.) and follows it, while still allowing the user to orbit around it.
- **Solution:** A manager that intercepts the update loop and delegates control to either the `OrbitMoveController` or internal tracking logic.

## Responsibilities & Boundaries

- **In-scope:**
  - Monitoring `focusStore` for state changes.
  - Switching between 'free' and 'focused' modes.
  - Calculating the world position of focused objects (Agents, Nodes, Roads, Buildings) using `SimStore` snapshots or `focusedPosition` from the store.
  - Smoothly interpolating (`lerp`) the camera target to the focused object.
  - Delegating to `OrbitMoveController` when in free mode.
- **Out-of-scope:**
  - Handling raw input events (handled by `OrbitMoveController` and `InteractionManager`).
  - Rendering.

## Architecture & Design

- **Class:** `CameraManager`
- **Dependencies:**
  - `THREE.PerspectiveCamera`
  - `OrbitControls` (Three.js)
  - `OrbitMoveController` (Our wrapper)
  - `SimStore` (For object positions)
- **Logic:**
  - **Free Mode:** Just calls `orbitMoveController.update(dt)`.
  - **Focused Mode:**
    - Disables WASD logic (implicitly, by not calling `orbitMoveController.update`).
    - Enables `OrbitControls` (for mouse orbiting).
    - Every frame, determines target position:
      - For static objects (trees, buildings): Uses the position captured at click time (from `focusStore`).
      - For dynamic objects (agents): Looks up the live position in the latest simulation snapshot.
    - Lerps `controls.target` to that position.
    - Updates `camera.position` to maintain relative offset (following behavior).

## Public API / Usage

```ts
// In main.ts
const cameraManager = new CameraManager(camera, controls, moveControls, simStore);

// In render loop
engine.onUpdate((t) => {
  cameraManager.update(t.deltaTimeMs / 1000);
});
```
