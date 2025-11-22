---
title: "Agents View"
summary: "Manages the visual representation and interpolation of dynamic agents (trucks) within the simulation scene."
source_paths:
  - "src/view/agents-view.ts"
last_updated: "2025-11-22"
owner: "Mateusz Nędzi"
tags: ["view", "agents", "trucks", "three.js"]
links:
  parent: "../../SUMMARY.md"
  siblings:
    - "graph/graph-view.md"
---

# Agents View

> **Purpose:** Responsible for rendering and animating dynamic entities (primarily trucks) in the 3D scene, applying smooth interpolation between simulation snapshots.

## Context & Motivation

- **Problem solved:** The simulation runs at a different tick rate (or discrete steps) than the rendering loop (RAF). We need to visualize the state of agents smoothly.
- **Requirements:**
  - Render trucks at correct positions based on graph topology.
  - Interpolate position and rotation between two snapshots (`snapshotA` and `snapshotB`).
  - Manage lifecycle (create/destroy) of truck meshes.
  - **Constraint:** Only render trucks when they are actively traversing a road (edge). Trucks stationary at nodes are currently hidden.

## Responsibilities & Boundaries

- **In-scope:**
  - Creating and disposing `THREE.Group` instances for trucks.
  - Updating truck transforms (position, rotation) every frame.
  - calculating 3D coordinates from graph data (`edgeId`, `progress`).
- **Out-of-scope:**
  - Simulation logic (pathfinding, movement physics).
  - Static map rendering (handled by `GraphView`).

## Architecture & Design

The `AgentsView` class maintains a mapping of `TruckId` to `THREE.Group` (the visual mesh).

### Data Flow

1. `update(frame: SimFrame, transform: GraphTransform)` is called by the main view loop.
2. It iterates through trucks in the current snapshot (`snapshotB`).
3. **Filter:** Checks if the truck is on an edge (`currentEdgeId` is present).
4. **Lifecycle:** Creates a new mesh if one doesn't exist.
5. **Interpolation:**
   - Computes 3D position for state A (previous) and state B (current).
   - Lerps between them using `frame.alpha`.
   - Orients the truck to face the direction of movement.
6. **Cleanup:** Removes meshes for trucks that are no longer present or valid (e.g. reached destination and disappeared, or moved to a node and became hidden).

### Position Calculation

The view transforms abstract graph coordinates (Edge ID + Progress) into 3D world coordinates:
1. Retrieve `Road` from snapshot.
2. Get Start and End `Node` positions.
3. Interpolate between Start and End nodes based on `edgeProgress` / `roadLength`.
4. Apply height offset (`GRAPH_ROAD_ELEVATION` + `ROAD_THICKNESS`).

## Algorithms & Complexity

- **Update Loop:** $O(N)$ where $N$ is the number of active trucks.
- **Map Lookups:** $O(1)$ for accessing nodes/edges/meshes.
- **Cleanup:** $O(M)$ where $M$ is the number of currently rendered meshes.

## Public API

```typescript
export class AgentsView {
  constructor(scene: THREE.Scene);
  update(frame: SimFrame, transform: GraphTransform): void;
  dispose(): void;
}
```

## Implementation Notes

- **Interpolation Logic:** Supports interpolating from a "Node" state to an "Edge" state (e.g., just leaving a depot) to prevent jumping, even though trucks strictly at nodes are not rendered in the target state.
- **Orientation:** Calculated dynamically based on the movement vector between interpolated frames.
- **Materials:** Uses standard low-poly assets from `src/engine/objects/truck.ts`.

## References

- [Graph View](graph/graph-view.md)
- [Graph Transform](graph/graph-transform.md)

