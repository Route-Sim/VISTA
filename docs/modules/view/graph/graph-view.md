---
title: 'Graph View'
summary: 'Renders simulation nodes and roads as low-poly primitives in the three.js scene, keeping geometry lifecycle in sync with buffered snapshots.'
source_paths:
  - 'src/view/graph/graph-view.ts'
last_updated: '2025-11-09'
owner: 'Mateusz Nędzi'
tags: ['module', 'view', 'engine', 'graph']
links:
  parent: '../../../SUMMARY.md'
  siblings: []
---

# Graph View

> Purpose: Maintain a dedicated scene subtree that visualizes the simulation road network. GraphView translates immutable snapshot data into node meshes and road lines while preserving the low-poly warm-world style foundations.

## Context & Motivation

- Problem solved: show the underlying logistics graph (nodes + roads) inside the three.js world.
- Requirements and constraints:
  - Read-only access to snapshots; no mutations back into the store.
  - Efficient diffing between successive frames to minimize allocations.
  - Geometry adheres to warm, low-poly style guidelines (flat shading, warm palette, gentle elevation).
- Dependencies and assumptions:
  - Nodes contain planar coordinates (`x`, `y`) in meters.
  - Roads reference valid start/end nodes; if not present they are skipped defensively.
  - Relies on `createGraphNodeMesh`/`createGraphRoadLine` factories for consistent styling.

## Responsibilities & Boundaries

- In-scope:
  - Maintain `THREE.Group` hierarchy for nodes and roads.
  - Create/destroy meshes and lines as the snapshot graph changes.
  - Update transforms for existing objects per frame.
- Out-of-scope:
  - Higher-level layout decisions (handled by simulation data).
  - Animated agents, buildings, or HUD overlays.

## Architecture & Design

- Key structures:
  - `root` group containing `roadGroup` and `nodeGroup` child groups.
  - Maps from IDs to meshes/lines (`nodeMeshes`, `roadLines`).
- Data flow:
  - `GraphView.update(frame)` selects `frame.snapshotB` (latest) and synchronizes nodes then roads.
  - Node positions map to 3D using `x → x`, `y → z`, with a small Y elevation to avoid z-fighting.
- Resource handling:
  - Uses graph primitive factories, ensuring shared material parameters and dimensions.
  - Buffer attributes reused for road line segments; positions array updated each frame.

## Algorithms & Complexity

- Node sync: O(|nodes|) creation/update plus O(|stale|) removals.
- Road sync: O(|roads|) creation/update plus O(|stale|) removals.
- Each update reuses buffer attributes avoiding reallocation.

## Public API / Usage

```start:GraphView.update:src/view/graph/graph-view.ts
update(frame: SimFrame): void {
  const snapshot = frame.snapshotB;
  this.syncRoads(snapshot);
  this.syncNodes(snapshot);
}
```

- Instantiate via `new GraphView(scene)`; call `update(frame)` every render tick.
- Call `dispose()` when tearing down the scene to free geometries/materials.

## Implementation Notes

- Cylindrical nodes align with style guide; factories disable shadows to keep visuals soft.
- Roads sit slightly above ground (`GRAPH_ROAD_ELEVATION`) to avoid z-fighting with the ground plane.
- Defensive guards skip roads if referenced nodes are missing, preventing runtime errors during partial updates.

## Tests (If Applicable)

- Manual QA: connect to live simulation feed and verify nodes/roads appear and disappear correctly.
- Future automated tests could render to an off-screen WebGL context and assert group contents.

## Performance

- Buffer attribute reuse keeps GC pressure low.
- Maps provide O(1) lookup for incremental updates.

## Security & Reliability

- Input validation limited to presence of referenced nodes; additional schema validation occurs upstream (`sim/adapters`).
- Disposal routines ensure three.js resources are released on teardown, preventing WebGL memory leaks.

## References

- `src/view/index.ts`
- `src/engine/objects/graph-primitives.ts`
- `src/sim/store/snapshot.ts`
- `docs/style-guide.md`
