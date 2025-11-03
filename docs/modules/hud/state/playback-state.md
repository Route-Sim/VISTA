---
title: 'Playback State'
summary: 'React context provider that tracks global playback status (idle, playing, paused, stopped) for coordinating HUD panel visibility.'
source_paths:
  - 'src/hud/state/playback-state.tsx'
last_updated: '2025-11-01'
owner: 'Mateusz Nędzi'
tags: ['module', 'hud', 'react', 'state', 'context']
links:
  parent: '../index.md'
  siblings:
    - './hud-visibility.md'
---

# Playback State

> **Purpose:** Provide a global React context for tracking playback status across HUD components. Enables coordination between playback controls and other panels (e.g., hiding creator panels when simulation starts).

## Context & Motivation

The HUD needs to coordinate panel visibility based on playback state. For example, Map Creator and Fleet Creator panels should be hidden when the simulation starts. This context provides a single source of truth for playback status.

## Responsibilities & Boundaries

- In-scope: Track playback status (`idle`, `playing`, `paused`, `stopped`), provide React context API.
- Out-of-scope: Network communication, domain logic, persistence (handled by PlayControls component).

## Architecture & Design

- `PlaybackStateProvider` wraps the HUD root and provides playback status context.
- `usePlaybackState()` hook allows components to read and update playback status.
- Status is synchronized by `PlayControls` component when user interacts with playback buttons.

## Public API / Usage

```tsx
import { PlaybackStateProvider, usePlaybackState } from '@/hud/state/playback-state';

// In provider tree
<PlaybackStateProvider>
  {/* HUD components */}
</PlaybackStateProvider>

// In component
function MyComponent() {
  const { status, setStatus } = usePlaybackState();
  // status: 'idle' | 'playing' | 'paused' | 'stopped'
}
```

## Implementation Notes

- Status defaults to `'idle'` on mount.
- `PlayControls` component syncs its local state to global context via `setStatus`.
- Used by `CreatorPanels` to hide/show Map Creator and Fleet Creator based on status.

## References

- Parent: [`../index.md`](../index.md)
- Related: [`../containers/play-controls.md`](../containers/play-controls.md)

