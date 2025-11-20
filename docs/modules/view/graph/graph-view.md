---
title: 'Graph View'
summary: 'Renders simulation nodes, roads, and associated buildings (parking lots and delivery sites) as low-poly primitives in the three.js scene, keeping geometry lifecycle in sync with buffered snapshots.'
source_paths:
  - 'src/view/graph/graph-view.ts'
last_updated: '2025-11-20'
owner: 'Mateusz Nędzi'
tags: ['module', 'view', 'engine', 'graph']
links:
  parent: '../../../SUMMARY.md'
  siblings: []
---

# Graph View

> Purpose: Maintain a dedicated scene subtree that visualizes the simulation road network and attached infrastructure. GraphView translates immutable snapshot data into node meshes, road lines, parking lots, and delivery sites while preserving the low-poly warm-world style foundations.

## Context & Motivation

- Problem solved: show the underlying logistics graph (nodes + roads + buildings) inside the three.js world.
- Requirements and constraints:
  - Read-only access to snapshots; no mutations back into the store.
  - Efficient diffing between successive frames to minimize allocations.
  - Geometry adheres to warm, low-poly style guidelines (flat shading, warm palette, gentle elevation).
- Dependencies and assumptions:
  - Nodes contain planar coordinates (`x`, `y`) in meters.
  - Roads reference valid start/end nodes; if not present they are skipped defensively.
  - Relies on graph object factories and normalization helpers for consistent styling and positioning.

## Responsibilities & Boundaries

- In-scope:
  - Maintain `THREE.Group` hierarchy for nodes, roads, parking lots, and delivery sites.
  - Create/destroy meshes and lines as the snapshot graph changes.
  - Update transforms for existing objects per frame.
  - Handle procedural placement of buildings (parking lots and delivery sites) relative to connected roads.
- Out-of-scope:
  - Higher-level layout decisions (handled by simulation data).
  - Animated agents or HUD overlays.

## Architecture & Design

- Key structures:
  - `root` group containing `roadGroup`, `intersectionGroup`, and `siteGroup`.
  - Maps from IDs to meshes/groups (`intersectionMeshes`, `roadMeshes`, `siteMeshes`).
- Data flow:
  - `GraphView.update(frame)` selects `frame.snapshotB` (latest), computes `GraphTransform` (center + scale), then synchronizes nodes, roads, and buildings.
  - Node positions map to 3D using normalized `x → x`, `y → z`, with a small Y elevation.
  - Buildings (parking lots and delivery sites) are positioned by finding a connected road and calculating an offset to place them adjacent to the road near the intersection.
- Resource handling:
  - Uses graph primitive factories, ensuring shared material parameters and dimensions.
  - Buildings use `THREE.Group` instances created by the object factories.

## Algorithms & Complexity

- Node sync: O(|nodes|) creation/update plus O(|stale|) removals.
- Road sync: O(|roads|) creation/update plus O(|stale|) removals.
- Building sync (parking lots and sites): O(|buildings|) creation/update plus O(|stale|) removals. Requires O(1) adjacency lookup per building.
- Normalization runs in O(|nodes|) to compute bounding center.

## Public API / Usage

```start:GraphView.update:src/view/graph/graph-view.ts
update(frame: SimFrame): void {
  const snapshot = frame.snapshotB;
  const transform = computeGraphTransform(snapshot);
  // ... adjacency build ...
  // Internally handles intersections, roads, and buildings
  this.syncNodes(snapshot, transform, adjacency); 
  this.syncRoads(snapshot, transform, offsets);
  this.syncSites(snapshot, transform, adjacency);
}
```

- Instantiate via `new GraphView(scene)`; call `update(frame)` every render tick.
- Call `dispose()` when tearing down the scene to free geometries/materials.

## Implementation Notes

- Cylindrical nodes align with style guide; factories disable shadows to keep visuals soft.
- Roads sit slightly above ground (`GRAPH_ROAD_ELEVATION`) to avoid z-fighting with the ground plane.
- Roads receive a deterministic Y-offset based on road class priority (e.g., highways `A` sit above local roads `L`) to resolve z-fighting at intersections.
- Buildings (parking lots and delivery sites) are procedurally placed:
  - They align with the first connected road found for their node.
  - They are offset sideways and along the road to avoid overlapping the intersection or the road itself.
  - They are scaled to match the graph visualization scale.
  - Delivery sites account for their internal 0.375 scale factor when applying the graph transform scale.
- Bounding-box centering keeps the graph around the world origin, while a global scale keeps distances manageable for the camera rig.
- Defensive guards skip roads/buildings if referenced nodes are missing.

## Tests (If Applicable)

- Manual QA: connect to live simulation feed and verify nodes/roads/buildings appear and disappear correctly.
- Verify buildings (parking lots and delivery sites) are placed next to roads and not on top of them.

## Performance

- Buffer attribute reuse keeps GC pressure low.
- Maps provide O(1) lookup for incremental updates.
- Adjacency list rebuilt per frame (cheap for typical graph sizes).

## Security & Reliability

- Input validation limited to presence of referenced nodes; additional schema validation occurs upstream (`sim/adapters`).
- Disposal routines ensure three.js resources are released on teardown, preventing WebGL memory leaks.

## References

- `src/view/index.ts`
- `src/engine/objects/node.ts`
- `src/engine/objects/road.ts`
- `src/engine/objects/parking.ts`
- `src/engine/objects/delivery-site.ts`
- `src/view/graph/graph-transform.ts`
- `src/sim/store/snapshot.ts`
- `docs/style-guide.md`
