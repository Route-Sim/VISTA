---
title: 'Map Creator'
summary: 'Full-screen container for map creation and editing. Displayed when simulation is idle, hidden when simulation starts.'
source_paths:
  - 'src/hud/containers/map-creator.tsx'
last_updated: '2025-11-01'
owner: 'Mateusz Nędzi'
tags: ['module', 'hud', 'react', 'ui', 'container']
links:
  parent: '../index.md'
  siblings:
    - './fleet-creator.md'
    - './play-controls.md'
    - './camera-help.md'
---

# Map Creator

> **Purpose:** A full-screen container panel for map creation and editing functionality. Currently a placeholder, to be extended with map editing tools.

## Context & Motivation

The Map Creator panel provides a dedicated workspace for users to create and configure simulation maps before starting a simulation. It occupies the left half of the screen when visible.

## Responsibilities & Boundaries

- In-scope: Display as a full-screen container (50% width), provide title and structure for future map editing features.
- Out-of-scope: Actual map editing logic, three.js scene manipulation (handled by engine/view layers).

## Architecture & Design

- Built on `HudContainer` component with `closable={false}` to prevent manual dismissal.
- Takes full height of its container and uses flexbox for centering placeholder content.
- Visibility is controlled by playback state: visible when simulation is `idle` or `stopped`, hidden when `playing`.

## Public API / Usage

```tsx
import { MapCreator } from '@/hud/containers/map-creator';

<MapCreator />
```

## Implementation Notes

- Uses `HudContainer` with `className="h-full flex flex-col"` for full-height layout.
- Content area is currently empty with a placeholder comment.
- Not closable by user interaction; visibility managed by playback state.

## References

- Parent: [`../index.md`](../index.md)
- Sibling: [`./fleet-creator.md`](./fleet-creator.md)
- State: [`../state/playback-state.md`](../state/playback-state.md)

