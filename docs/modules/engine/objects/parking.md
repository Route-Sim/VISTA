---
title: 'Parking'
summary: 'Procedural generation of low-poly parking lots with double-row layout and central corridor.'
source_paths:
  - 'src/engine/objects/parking.ts'
last_updated: '2025-11-19'
owner: 'Mateusz Nędzi'
tags: ['module', 'engine', 'objects']
links:
  parent: '../../SUMMARY.md'
  siblings:
    - 'truck.md'
    - 'road.md'
---

# Parking

> **Purpose:** Generates a rectangular parking block containing two rows of spots separated by a central driving corridor.

## Context & Motivation

- **Problem solved**: Efficient layout for vehicle storage in the simulation.
- **Requirements**:
  - 3:2 aspect ratio block (approximate).
  - Smaller spots (2.4m x 5m) for density.
  - Central corridor for access.

## Architecture & Design

### Key Functions

- `createParkingLot(options: ParkingOptions): THREE.Group`

### Configuration

- `PARKING_SPOT_WIDTH`: 2.4m
- `PARKING_SPOT_DEPTH`: 5.0m
- `PARKING_CORRIDOR_WIDTH`: 7.0m (Central aisle)

### Data Flow

1. **Input**: Total `spots` (default 20).
2. **Layout**:
   - Splits spots into 2 rows (`spots / 2`).
   - Calculates total width: `spotsPerRow * spotWidth`.
   - Calculates total depth: `2 * spotDepth + corridorWidth`.
3. **Generation**:
   - Creates a single large asphalt base.
   - Iterates to place divider lines for both the North and South rows.

## Public API / Usage

```ts
import { createParkingLot } from '@/engine/objects/parking';

// Create a standard block (~20 spots, 10 per side)
const parking = createParkingLot({ spots: 20 });
scene.add(parking);
```

## Implementation Notes

- **Geometry**: Simple `BoxGeometry` primitives.
- **Layout**:
  - Row 1 centered at `-zOffset`.
  - Row 2 centered at `+zOffset`.
  - `zOffset` calculated from corridor width and spot depth.
- **Z-Fighting**: Lines are slightly raised above the base.

## Performance

- **Draw Calls**: Uses simple meshes added to a Group. For high-scale city generation, geometry merging or instancing would be preferred, but current object count is low.
