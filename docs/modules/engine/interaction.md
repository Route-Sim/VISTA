---
title: 'Interaction Manager'
summary: 'Handles mouse interactions (clicks) with the 3D scene to select objects.'
source_paths:
  - 'src/engine/interaction.ts'
last_updated: '2025-11-23'
owner: 'Mateusz Nędzi'
tags: ['engine', 'interaction', 'raycast', 'input']
links:
  parent: '../../SUMMARY.md'
  siblings:
    - '../hud/state/focus-state.md'
---

# Interaction Manager

> **Purpose:** Detects user clicks on 3D objects in the scene and updates the global focus state.

## Context & Motivation

- **Problem:** The user needs to select objects in the 3D view to inspect them.
- **Solution:** A dedicated manager that listens for pointer events on the canvas and performs raycasting against the scene.

## Responsibilities & Boundaries

- **In-scope:** Listening for pointer events (down, move, up), detecting clicks (vs drags), raycasting, finding the clicked object's metadata (`userData`), updating `focusStore`.
- **Out-of-scope:** Managing camera movement (OrbitControls), rendering (Engine).

## Architecture & Design

- **Class:** `InteractionManager`
- **Logic:**
  1. Track `pointerdown` position.
  2. On `pointermove`, if distance > threshold, mark as dragging.
  3. On `pointerup`, if not dragging:
     - Convert mouse coords to NDC.
     - Raycast from camera.
     - Walk up the scene graph from the intersected object to find one with `userData.id` and `userData.type`.
     - Capture the world position of the clicked object (`obj.getWorldPosition()`).
     - Call `focusStore.setFocus` with ID, type, and position.

## Implementation Notes

- Uses `THREE.Raycaster`.
- Requires objects to have specific `userData` structure: `{ id: string, type: FocusType }`.
- Filters out drag gestures to prevent accidental selection while moving the camera.

## Public API / Usage

```ts
// In main.ts
const interaction = new InteractionManager(camera, scene, canvas);

// Cleanup
interaction.dispose();
```
