---
title: 'Simulation Clock'
summary: 'A HUD component displaying the current simulation day and time at the top-center of the screen. Subscribes to SimStore updates for real-time clock rendering.'
source_paths:
  - 'src/hud/containers/simulation-clock.tsx'
last_updated: '2025-12-14'
owner: 'Mateusz Nędzi'
tags: ['module', 'hud', 'component']
links:
  parent: '../../../SUMMARY.md'
  siblings:
    - './play-controls.md'
    - './focus-inspector.md'
---

# Simulation Clock

> **Purpose:** Display the current simulation time and day in the virtual world. This component provides at-a-glance temporal context for users watching the simulation unfold.

## Context & Motivation

During simulation playback, users need to understand the current virtual time to:

- Correlate events with time-of-day patterns (e.g., rush hour, night operations)
- Track multi-day simulation progress
- Understand package deadlines relative to current time

The clock is positioned at the top-center of the screen for high visibility without obstructing the main 3D view.

## Responsibilities & Boundaries

**In-scope:**

- Subscribe to `SimStore` snapshot updates
- Format and display simulation day (1-indexed integer)
- Format and display simulation time (24h format as HH:MM)

**Out-of-scope:**

- Time manipulation controls (handled by play-controls)
- Historical time tracking or timelines

## Architecture & Design

The component uses React hooks to:

1. Access the `SimStore` via `useSimStore()` context hook
2. Subscribe to snapshot updates for reactive rendering
3. Format time using the `formatSimulationTime` selector from the sim layer

```tsx
function SimulationClock(): React.ReactNode {
  const store = useSimStore();
  const [simTime, setSimTime] = React.useState(() => {
    const draft = store.getWorkingDraft();
    return draft.simulationTime;
  });

  React.useEffect(() => {
    const unsubscribe = store.subscribe((snapshot) => {
      setSimTime(snapshot.simulationTime);
    });
    return unsubscribe;
  }, [store]);

  const formattedTime = formatSimulationTime(simTime.time);
  // Render day and time...
}
```

## Visual Design

The clock follows the Low-Poly Warm World Style Guide:

- Warm amber accent color for icons (Calendar, Clock from lucide-react)
- Semi-transparent white background with backdrop blur
- Rounded corners and subtle shadow for floating appearance
- Tabular numeric font for stable width during updates

## Public API / Usage

The component is self-contained and requires no props. It must be rendered within a `SimStoreProvider`.

```tsx
import { SimulationClock } from '@/hud/containers/simulation-clock';

// Within SimulationPanels:
<div className="fixed top-4 left-1/2 -translate-x-1/2">
  <SimulationClock />
</div>
```

## Data Flow

```
tick.start signal (with time/day)
  → wire-net-to-sim adapter
  → SimStore.ingest()
  → updates simulationTime in snapshot
  → notifies subscribers
  → SimulationClock re-renders
```

## Implementation Notes

- Uses `lucide-react` icons (Calendar, Clock) for visual clarity
- Time formatting handles edge cases (e.g., 0:00, 23:59)
- Component only renders during active simulation (within `SimulationPanels`)

## References

- [SimStore](../../sim/store/sim-store.md) - State management
- [Domain Entities](../../sim/domain/entities.md) - SimulationTime type
- [Play Controls](./play-controls.md) - Sibling playback UI
