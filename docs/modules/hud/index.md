---
title: 'HUD Layer'
summary: 'A modular, toggleable heads-up display built with React and shadcn/ui. Panels are independent containers that can be shown/hidden and extended without coupling to rendering or networking.'
source_paths:
  - 'src/hud/index.tsx'
  - 'src/hud/state/hud-visibility.tsx'
  - 'src/hud/state/playback-state.tsx'
  - 'src/hud/components/hud-container.tsx'
  - 'src/hud/components/hud-menu.tsx'
last_updated: '2025-11-01'
owner: 'Mateusz Nędzi'
tags: ['module', 'hud', 'react', 'ui']
links:
  parent: '../../SUMMARY.md'
  siblings:
    [
      './containers/play-controls.md',
      './containers/camera-help.md',
      './containers/map-creator.md',
      './containers/fleet-creator.md',
      './containers/start-simulation.md',
      './containers/agent-inspector.md',
    ]
---

# HUD Layer

> Purpose: Provide a clean, modular HUD composed of small, reusable containers. Each panel has a single responsibility and can be independently shown/hidden. The HUD is UI-only and does not mutate engine, sim, or net layers.

## Responsibilities & Boundaries

- In-scope: Overlay composition, panel visibility, panel menu, basic playback UI, camera help UI.
- Out-of-scope: Network actions, domain mutation, three.js scene changes (handled by engine/view layers).

## Architecture & Design

- `hud/index.tsx` mounts a fixed overlay with `pointer-events-none` and places panels using fixed anchors.
- `HudVisibilityProvider` offers a context for per-panel visibility with localStorage persistence.
- `PlaybackStateProvider` tracks global playback status for coordinating panel visibility.
- `HudContainer` is a shared wrapper (title bar + hide action) ensuring consistent look and accessibility.
- `HudMenu` exposes a dropdown to toggle panels without a keyboard shortcut.
- `CreatorPanels` component renders Map Creator and Fleet Creator full-screen (50/50 split) when simulation is idle.

Data flow: User acts on HUD → optional callback(s) prepared for future net wiring → no side effects for now. Playback status changes trigger visibility updates for creator panels.

## Public API / Usage

- Mounting API (preserved):

```ts
import { mountHud } from '@/hud';
const hud = mountHud();
hud.toggle(); // global HUD visibility handled in main.ts via the H key
```

## Implementation Notes

- React + shadcn/ui components (Card, Button, Slider, DropdownMenu, Separator).
- Layout:
  - Map Creator, Fleet Creator, and Start Simulation: full-screen split (33/33/33) when simulation is idle
  - Camera Help, Play Controls, Net Events: left sidebar when simulation is active
  - HUD menu: bottom-right when simulation is active
- Explicit types and no implicit any. No three.js or domain types in HUD.
- Creator panels automatically hide when simulation starts (`status === 'playing'`) and show when idle or stopped. Start Simulation panel provides a button to initiate the simulation.

## References

- Containers: [`./containers/play-controls`](./containers/play-controls.md), [`./containers/camera-help`](./containers/camera-help.md), [`./containers/map-creator`](./containers/map-creator.md), [`./containers/fleet-creator`](./containers/fleet-creator.md), [`./containers/start-simulation`](./containers/start-simulation.md), [`./containers/agent-inspector`](./containers/agent-inspector.md)
- State: [`./state/playback-state.md`](./state/playback-state.md)
