---
title: 'Start Simulation'
summary: 'Panel displayed alongside Map Creator and Fleet Creator that provides a button to start the simulation. Only visible when simulation is idle or stopped.'
source_paths:
  - 'src/hud/containers/start-simulation.tsx'
last_updated: '2025-11-01'
owner: 'Mateusz Nędzi'
tags: ['module', 'hud', 'react', 'ui', 'container']
links:
  parent: '../index.md'
  siblings:
    - './map-creator.md'
    - './fleet-creator.md'
    - './play-controls.md'
---

# Start Simulation

> **Purpose:** A simple panel that provides a single button to start the simulation. Displayed alongside Map Creator and Fleet Creator panels when the simulation is idle or stopped.

## Context & Motivation

Since Play Controls and other simulation panels are hidden before simulation starts, users need a way to initiate the simulation. The Start Simulation panel provides this functionality in a dedicated panel that appears alongside the creator panels.

## Responsibilities & Boundaries

- In-scope: Display a start button, trigger simulation start command via playback controller.
- Out-of-scope: Playback controls (pause, resume, pause, stop), tick rate configuration (handled by Play Controls panel).

## Architecture & Design

- Built on `HudContainer` component with `closable={false}` to prevent manual dismissal.
- Takes full height of its container and uses flexbox for centering the start button.
- Uses the same playback controller as Play Controls to send the `play` command.
- Visibility is controlled by playback state: visible when simulation is `idle` or `stopped`, hidden when `playing` or `paused`.

## Public API / Usage

```tsx
import { StartSimulation } from '@/hud/containers/start-simulation';
import { usePlaybackNetController } from '@/hud/hooks/use-playback-controller';

const controller = usePlaybackNetController();
<StartSimulation controller={controller} />
```

## Implementation Notes

- Uses `HudContainer` with `className="h-full flex flex-col"` for full-height layout.
- Contains a single large button with Play icon that triggers the `play` command.
- Button uses `size="lg"` and centered layout for prominent visibility.
- When clicked, calls `controller?.commandSink?.({ type: 'play' })` which sends `simulation.start` action via network.

## References

- Parent: [`../index.md`](../index.md)
- Siblings: [`./map-creator.md`](./map-creator.md), [`./fleet-creator.md`](./fleet-creator.md), [`./play-controls.md`](./play-controls.md)
- State: [`../state/playback-state.md`](../state/playback-state.md)
- API: [`../api/playback.ts`](../api/playback.ts)
