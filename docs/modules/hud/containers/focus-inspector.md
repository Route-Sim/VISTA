---
title: "Focus Inspector"
summary: "A detailed HUD panel that displays real-time properties of the currently focused object."
source_paths:
  - "src/hud/containers/focus-inspector.tsx"
  - "src/hud/hooks/use-sim-snapshot.ts"
  - "src/hud/hooks/use-selected-object.ts"
last_updated: "2025-11-23"
owner: "Mateusz Nędzi"
tags: ["hud", "inspector", "focus", "sim-store"]
links:
  parent: "../../SUMMARY.md"
  siblings:
    - "../state/focus-state.md"
    - "../state/sim-context.md"
---

# Focus Inspector

> **Purpose:** Provides detailed, real-time information about the user's selected object (trucks, roads, buildings, etc.) in the simulation.

## Context & Motivation

- **Problem:** Users need to see more than just the ID of what they clicked. They need actionable data like speed, fuel, cargo, or traffic congestion.
- **Solution:** A reactive inspector panel that queries the simulation state every tick to show live metrics.

## Responsibilities & Boundaries

- **In-scope:**
  - Rendering type-specific data fields (e.g., Speed for Agents, Capacity for Parking).
  - Subscribing to the `SimStore` to update UI on every simulation tick.
  - Handling the "Unfocus" action.
- **Out-of-scope:**
  - Setting the focus (handled by `InteractionManager`).
  - Modifying the simulation state (read-only).

## Architecture & Design

- **Components:**
  - `FocusInspector`: Main container that switches content based on `FocusType`.
- **Hooks:**
  - `useSelectedObject`: Combines `FocusState` (selection) and `SimStore` (data) to return a fully hydrated object.
  - `useSimSnapshot`: React hook that subscribes to `SimStore` updates via `useSyncExternalStore`.
- **State Access:**
  - Uses `SimStoreContext` to access the simulation store instance passed from `main.ts`.

## Public API / Usage

```tsx
// Used internally in HUD layout
<FocusInspector />
```

## Performance Notes

- Subscribes to the `SimStore` tick cycle. Updates approximately 60 times per second when simulation is running.
- Uses `useSyncExternalStore` to avoid tearing and ensure React renders consistent snapshots.

