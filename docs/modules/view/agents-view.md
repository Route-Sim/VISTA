---
title: "Agents View"
summary: "Manages the visual representation of dynamic agents (trucks) within the simulation scene using simplified static logic."
source_paths:
  - "src/view/agents-view.ts"
last_updated: "2025-11-23"
owner: "Mateusz Nędzi"
tags: ["view", "agents", "trucks", "three.js"]
links:
  parent: "../../SUMMARY.md"
  siblings:
    - "graph/graph-view.md"
---

# Agents View

> **Purpose:** Responsible for rendering dynamic entities (primarily trucks) in the 3D scene. Currently uses a simplified static positioning logic based on discrete simulation states.

## Context & Motivation

- **Problem solved:** Visualizing the state of agents on the graph.
- **Requirements:**
  - Render trucks at correct positions based on graph topology.
  - Support two distinct display states:
    1. **At Node:** Stationary at a node, facing the first step of their route.
    2. **On Road:** Placed at the beginning of an edge, facing the destination node.
  - Manage lifecycle (create/destroy) of truck meshes.
  - **Constraint:** Interpolation and smooth movement are temporarily disabled for debugging purposes.

## Responsibilities & Boundaries

- **In-scope:**
  - Creating and disposing `THREE.Group` instances for trucks.
  - Updating truck transforms (position, rotation) every frame based on the latest snapshot.
  - Calculating 3D coordinates from graph data (`currentNodeId`, `currentEdgeId`).
- **Out-of-scope:**
  - Simulation logic (pathfinding, movement physics).
  - Static map rendering (handled by `GraphView`).
  - Interpolation between simulation ticks (currently disabled).

## Architecture & Design

The `AgentsView` class maintains a mapping of `TruckId` to `THREE.Group` (the visual mesh).

### Data Flow

1. `update(frame: SimFrame, transform: GraphTransform)` is called by the main view loop.
2. It uses only the latest snapshot (`snapshotB`) from the frame; `snapshotA` and `alpha` are ignored.
3. **Filter:** Checks if the truck is in a valid display state:
   - **State 1:** `currentNodeId` is set (and not in a building).
   - **State 2:** `currentEdgeId` is set (and `currentNodeId` is null).
4. **Lifecycle:** Creates a new mesh if one doesn't exist.
5. **Positioning:**
   - **At Node:** Position = Node coordinates. Orientation = Towards `route[0]`.
   - **On Road:** Position = Start Node of the road. Orientation = Towards End Node.
6. **Cleanup:** Removes meshes for trucks that are no longer in a valid display state.

### Position Calculation

The view transforms abstract graph coordinates into 3D world coordinates using `GraphTransform`:
- Uses `toVector3(node, transform, target)` to map simulation coordinates (meters) to scene coordinates.
- Applies a Y-offset (`GRAPH_ROAD_ELEVATION` + `ROAD_THICKNESS`) to place trucks on top of roads.

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

- **Static Logic:** The current implementation deliberately avoids interpolation (`lerp`) to isolate display logic from simulation timing issues.
- **Orientation:** Calculated statically based on the graph topology (Node -> Next Node) rather than movement vectors.
- **Materials:** Uses standard low-poly assets from `src/engine/objects/truck.ts`.

## References

- [Graph View](graph/graph-view.md)
- [Graph Transform](graph/graph-transform.md)
