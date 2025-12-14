---
title: "Object Picker"
summary: "A searchable HUD component that allows users to quickly find and focus on trucks or buildings in the simulation without clicking on them directly in the 3D scene."
source_paths:
  - "src/hud/containers/object-picker.tsx"
last_updated: "2024-12-14"
owner: "Mateusz Nędzi"
tags: ["hud", "container", "navigation", "focus"]
links:
  parent: "../../SUMMARY.md"
  siblings:
    - "focus-inspector.md"
---

# Object Picker

> **Purpose:** The Object Picker provides an alternative way to select and focus on simulation objects (trucks and buildings) using a searchable command palette interface, complementing the direct 3D click-to-focus interaction.

## Context & Motivation

While clicking on objects in the 3D scene is intuitive, it can be cumbersome when:

- The user wants to find a specific truck or building by name/ID
- Many objects overlap or are densely packed
- The camera is positioned far from the target object
- The user prefers keyboard-driven navigation

The Object Picker addresses these scenarios by providing a filterable list of all selectable objects in the simulation.

## Responsibilities & Boundaries

**In-scope:**

- Listing all trucks and buildings from the current simulation snapshot
- Providing search/filter functionality across object names and IDs
- Triggering focus on selected objects via the focus store
- Displaying relevant metadata (package count for trucks, building type)

**Out-of-scope:**

- Camera animation (handled by `CameraManager`)
- Object detail display (handled by `FocusInspector`)
- 3D position computation (delegated to `CameraManager` via focus store)

## Architecture & Design

### Component Structure

```
ObjectPicker
├── Collapsible (expand/collapse toggle)
│   └── Button (trigger)
└── CollapsibleContent
    └── Command (cmdk search interface)
        ├── CommandInput
        └── CommandList
            ├── CommandGroup "Trucks"
            │   └── CommandItem[] (one per truck)
            └── CommandGroup "Buildings"
                └── CommandItem[] (one per building)
```

### Data Flow

1. Component subscribes to `SimSnapshot` via `useSimSnapshot()` hook
2. `getAllTrucks()` and `getAllBuildings()` selectors extract entities
3. User searches/selects an item
4. `focusStore.setFocus(id, type)` is called
5. `CameraManager` receives focus change and animates camera
6. `FocusInspector` displays object details

### State Management

- **Local state:** `isOpen` for collapsible panel visibility
- **Derived state:** Truck and building lists via memoized selectors
- **Global state:** Focus state via `focusStore`

## Public API / Usage

The component is self-contained and requires no props:

```tsx
import { ObjectPicker } from '@/hud/containers/object-picker';

// In SimulationPanels:
<ObjectPicker />
```

### Focus Types

When selecting objects, the component uses these focus types:

- `'agent'` — for trucks (agents are the mobile entities)
- `'building'` — for sites, parkings, and gas stations

## Implementation Notes

### Searchable Values

Each `CommandItem` includes a composite `value` prop for search matching:

- Trucks: `"truck {id} {label}"`
- Buildings: `"building {kind} {id} {label}"`

This allows users to search by type, ID fragment, or display name.

### Building Labels

Buildings display:

- Site name if available (for sites with custom names)
- Fallback: `"{Kind} {id-suffix}"` (e.g., "Parking a1b2c3")

### Icon Mapping

Icons are color-coded by building type:

| Kind         | Icon            | Color  |
| ------------ | --------------- | ------ |
| site         | `Building2`     | Amber  |
| parking      | `ParkingCircle` | Green  |
| gas_station  | `Fuel`          | Red    |
| truck/agent  | `Truck`         | Blue   |

### Performance

- Truck and building lists are memoized with `useMemo`
- Empty state returns `null` to avoid rendering when no objects exist
- Command list is virtualized by `cmdk` for large lists

## Tests (If Applicable)

Recommended test cases:

- Renders nothing when simulation has no trucks or buildings
- Displays correct counts in header
- Search filters trucks by ID and label
- Search filters buildings by type, ID, and name
- Selecting a truck calls `focusStore.setFocus` with `'agent'` type
- Selecting a building calls `focusStore.setFocus` with `'building'` type

## Performance

- Memoization prevents unnecessary re-renders when snapshot changes don't affect trucks/buildings
- Collapsible panel avoids rendering the command list when closed (via unmount)

## Security & Reliability

- No user input is persisted or sent over network
- Component gracefully handles empty simulation state

## References

- [Focus Inspector](focus-inspector.md) — displays details of focused object
- [Focus State](../state/focus-state.md) — global focus store
- [Camera Manager](../../engine/camera-manager.md) — handles camera following
- [Selectors](../../sim/selectors.md) — `getAllTrucks`, `getAllBuildings`
