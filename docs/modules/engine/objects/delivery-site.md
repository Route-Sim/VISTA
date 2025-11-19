---
title: 'Delivery Site'
summary: 'A composite 3D object representing a warehouse delivery center with loading docks, props, and parking.'
source_paths:
  - 'src/engine/objects/delivery-site.ts'
last_updated: '2025-11-19'
owner: 'Mateusz Nędzi'
tags: ['engine', 'objects', 'environment']
links:
  parent: '../../SUMMARY.md'
  siblings:
    - 'ground.md'
    - 'truck.md'
    - 'parking.md'
---

# Delivery Site

> **Purpose:** Provides a complex, aesthetic environment piece representing a logistics hub or delivery center for the simulation visualization.

## Context & Motivation

- **Problem solved:** The simulation needs a visually interesting destination or hub for vehicles, rather than just empty ground or simple primitives.
- **Requirements:**
  - Low-poly aesthetic matching the "Warm World" style.
  - Multiple functional areas (docks, parking).
  - Colorful and detailed geometry.

## Responsibilities & Boundaries

- **In-scope:**
  - Warehouse geometry (walls, roof, vents).
  - Loading docks with doors and bumpers.
  - Concrete apron and foundation.
  - Decorative props (crates, pallets).
- **Out-of-scope:**
  - Dynamic interaction (doors opening, lights toggling) - this is purely a static view model for now.
  - Physics collision mesh generation (handled separately if needed).

## Architecture & Design

The `DeliverySite` is implemented as a function `createDeliverySite()` that returns a `THREE.Group`. It composes several sub-groups and meshes:

1.  **Apron:** A large base mesh representing the concrete loading area.
2.  **Building Group:** Contains the main warehouse structure, roof details, and vents.
3.  **Docks:** Iteratively generated detailed loading bays with bumpers, seals, and doors.
4.  **Props:** Scattered `BoxGeometry` meshes representing cargo.
5.  **Parking:** Integrates the `createParkingLot` utility for a staff/waiting area.

## Public API

```typescript
import { createDeliverySite } from '@/engine/objects/delivery-site';

const site = createDeliverySite();
scene.add(site);
```

## Implementation Notes

- **Materials:** Uses `MeshStandardMaterial` with `flatShading: true` to adhere to the low-poly style.
- **Colors:** Extends the global palette with warehouse-specific tones (beige, industrial grey, safety orange).
- **Performance:** Geometry is simple primitives. No merging is performed yet, so draw calls will increase with the number of sites. For a single site, this is negligible.

## References

- [Colors](../../app/colors.md)
- [Parking](parking.md)
