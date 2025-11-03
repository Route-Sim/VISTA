---
title: 'Fleet Creator'
summary: 'Full-screen container for fleet creation and configuration. Displayed when simulation is idle, hidden when simulation starts.'
source_paths:
  - 'src/hud/containers/fleet-creator.tsx'
last_updated: '2025-11-01'
owner: 'Mateusz Nędzi'
tags: ['module', 'hud', 'react', 'ui', 'container']
links:
  parent: '../index.md'
  siblings:
    - './map-creator.md'
    - './play-controls.md'
    - './camera-help.md'
---

# Fleet Creator

> **Purpose:** A full-screen container panel for fleet creation and configuration functionality. Currently a placeholder, to be extended with fleet editing tools.

## Context & Motivation

The Fleet Creator panel provides a dedicated workspace for users to create and configure simulation fleets before starting a simulation. It occupies the right half of the screen when visible.

## Responsibilities & Boundaries

- In-scope: Display as a full-screen container (50% width), provide title and structure for future fleet editing features.
- Out-of-scope: Actual fleet editing logic, domain mutation (handled by sim layer).

## Architecture & Design

- Built on `HudContainer` component with `closable={false}` to prevent manual dismissal.
- Takes full height of its container and uses flexbox for centering placeholder content.
- Visibility is controlled by playback state: visible when simulation is `idle` or `stopped`, hidden when `playing`.

## Public API / Usage

```tsx
import { FleetCreator } from '@/hud/containers/fleet-creator';

<FleetCreator />
```

## Implementation Notes

- Uses `HudContainer` with `className="h-full flex flex-col"` for full-height layout.
- Content area is currently empty with a placeholder comment.
- Not closable by user interaction; visibility managed by playback state.

## References

- Parent: [`../index.md`](../index.md)
- Sibling: [`./map-creator.md`](./map-creator.md)
- State: [`../state/playback-state.md`](../state/playback-state.md)

