---
title: 'Focus State'
summary: 'Global state management for the currently focused 3D object in the scene.'
source_paths:
  - 'src/hud/state/focus-state.ts'
last_updated: '2025-11-23'
owner: 'Mateusz Nędzi'
tags: ['hud', 'state', 'focus', 'interaction']
links:
  parent: '../../SUMMARY.md'
  siblings:
    - '../components/focus-status.md'
    - '../../engine/interaction.md'
---

# Focus State

> **Purpose:** Manages the global state of the currently "focused" or selected object in the 3D world, allowing the HUD to react to user selection.

## Context & Motivation

- **Problem:** We need a way to know which object the user has clicked on (e.g., a specific road, building, or agent) to show details or controls for it in the HUD.
- **Solution:** A lightweight global store that holds the ID, type, and (optionally) position of the currently focused object.

## Responsibilities & Boundaries

- **In-scope:** Storing `focusedId`, `focusedType`, and `focusedPosition` (Vector3). Providing actions to set/clear focus, notifying listeners (React components).
- **Out-of-scope:** Handling the actual click detection (handled by `InteractionManager`) or rendering the UI (handled by `FocusStatus`).

## Architecture & Design

- **Pattern:** Singleton store with subscription support, exposed via `useSyncExternalStore` hook for React integration.
- **State:**
  - `focusedId`: string | null
  - `focusedType`: 'node' | 'road' | 'building' | 'agent' | 'tree' | null
  - `focusedPosition`: THREE.Vector3 | null

## Public API / Usage

```ts
import { useFocusState, focusStore } from "@/hud/state/focus-state";

// Inside React component
const { focusedId, focusedType, clearFocus } = useFocusState();

// Outside React (e.g., engine)
focusStore.setFocus("road-123", "road", new THREE.Vector3(10, 0, 5));
```
