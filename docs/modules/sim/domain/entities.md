---
title: "SIM Domain Entities"
summary: "Normalized, serializable data interfaces for nodes, edges/roads, buildings (with Site as a subtype), trucks, packages, and agents. These are pure types with ID-only relations; behavior lives in systems and reducers."
source_paths:
  - "src/sim/domain/entities.ts"
  - "src/sim/domain/enums.ts"
  - "src/sim/domain/ids.ts"
last_updated: "2025-11-23"
owner: "Mateusz Nędzi"
tags: ["module", "sim", "domain", "types"]
links:
  parent: "../../../SUMMARY.md"
  siblings: []
---

# SIM Domain Entities

> Purpose: Define the immutable shapes of the simulation world. All relations are expressed with branded IDs to keep the domain serializable and portable. No methods; mutation occurs through reducers operating on snapshots.

## Responsibilities & Boundaries

- In-scope: type definitions for `Node`, `Edge`, `Road`, `Building` hierarchy (`Parking`, `Site`), `Truck`, `Package`, `Agent`.
- Out-of-scope: network payloads, three.js objects, rendering.

## Highlights

- Site is modeled as a subtype of Building; `SiteId` is an alias of `BuildingId`.
- `Road` extends `Edge` functionally; we alias `RoadId = EdgeId` so the same identity can be used in both maps.
- Relations use ID arrays (e.g., `Node.buildingIds`, `Road.truckIds`).
- Nodes now carry planar coordinates (`x`, `y`) in meters.
- `Edge` includes `lengthM` (meters). `Road` adds `roadClass`, `mode`, `lanes`, `maxSpeedKph`, and `weightLimitKg`.
- `Truck` includes rich state: fuel, CO2, message counters (`inboxCount`/`outboxCount`), and navigation state (`destination`, `routeStart`/`end`).

## Public Types (excerpt)

```ts
// BuildingBase { id, nodeId, kind, truckIds }
// Parking { kind: 'parking', capacity }
// Site { kind: 'site', name?, activityRate?, packageIds }
// Node { id, x, y, buildingIds }
// Edge { id, startNodeId, endNodeId, lengthM }
// Road { ...Edge, roadClass, mode, lanes, maxSpeedKph, weightLimitKg, truckIds }
// Truck { ...navState, inboxCount, outboxCount, currentBuildingId }
```

## Implementation Notes

- Entities are stored in normalized maps in `SimSnapshot`.
- Reducers replace entire entity objects when applying patches to avoid accidental mutation of frozen snapshots.

## References

- `src/sim/store/snapshot.ts`
- `src/sim/store/reducers.ts`
- `src/sim/selectors.ts`
