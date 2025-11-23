---
title: 'Inspector Components'
summary: 'Specialized UI components for displaying detailed simulation entity data in the HUD.'
source_paths:
  - 'src/hud/components/inspector/agent-inspector.tsx'
  - 'src/hud/components/inspector/road-inspector.tsx'
  - 'src/hud/components/inspector/node-inspector.tsx'
  - 'src/hud/components/inspector/building-inspector.tsx'
  - 'src/hud/components/inspector/tree-inspector.tsx'
  - 'src/hud/components/inspector/common.tsx'
last_updated: '2025-11-23'
owner: 'Mateusz Nędzi'
tags: ['hud', 'inspector', 'ui', 'components']
links:
  parent: '../../../SUMMARY.md'
  siblings:
    - '../../containers/focus-inspector.md'
---

# Inspector Components

> **Purpose:** A suite of components designed to visualize the specific properties of different simulation entities (Agents, Roads, Nodes, Buildings) within the `FocusInspector`.

## Context & Motivation

- **Problem:** A monolithic inspector component became hard to maintain as the number of entity properties grew.
- **Solution:** Split the inspector into domain-specific components that encapsulate the presentation logic for each entity type.

## Components

### AgentInspector

Displays live telemetry for `Truck` agents.

- **Data:** Speed, Fuel (with visual bar), CO2 Emissions, Cargo Load (inbox/outbox), Route progress.
- **Visuals:** Uses color-coded progress bars for fuel (amber) and cargo (blue).

### RoadInspector

Displays static and dynamic properties of `Road` segments.

- **Data:** Road class, Lanes, Speed Limit, Weight Limit, Length, active Truck count.
- **Visuals:** Shows start/end node IDs for topology context.

### NodeInspector

Displays properties of `Node` (intersections).

- **Data:** X/Y Coordinates, connected Building count.

### BuildingInspector

Handles both `Parking` and `Site` entities.

- **Parking:** Shows capacity vs occupancy.
- **Site:** Shows activity rate and pending package count.
- **Common:** Shows attached node and vehicle count.

### TreeInspector

A simple placeholder for decorative vegetation, confirming the object is purely visual.

### Common Utilities

Located in `common.tsx`:

- `InspectorHeader`: Standardized card header with icon, title, and ID.
- `KeyValue`: Formatted label-value row with optional units.
- `SectionHeader`: Small uppercase separator title.
- `InspectorFooter`: Standard "Return to default view" button.

## Usage

These components are intended to be used exclusively by `FocusInspector`.

```tsx
<AgentInspector id="truck-1" data={truckData} />
```

## Implementation Notes

- **Type Safety:** Props are typed against the domain entities (`Truck`, `Road`, etc.) from `src/sim/domain/entities.ts`.
- **Visual Consistency:** All inspectors share the same `Card` structure and `common` utility components to ensure a unified look and feel.
