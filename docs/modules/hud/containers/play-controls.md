---
title: 'HUD: Play Controls'
summary: 'Playback UI with play/pause/stop and a tick rate slider (1–240 Hz). Wired to @net via a controller hook mapping HUD commands to network actions.'
source_paths:
  - 'src/hud/containers/play-controls.tsx'
  - 'src/hud/api/playback.ts'
last_updated: '2025-11-01'
owner: 'Mateusz Nędzi'
tags: ['module', 'hud', 'ui']
links:
  parent: '../../../SUMMARY.md'
  siblings: ['../camera-help.md']
---

# Play Controls

> Purpose: Provide basic playback controls and tick rate adjustment. Network wiring is handled by a controller hook to keep UI decoupled from IO.

## Public API / Usage

```ts
export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'stopped';
export type PlaybackCommand =
  | { type: 'play' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'stop' }
  | { type: 'setTickRate'; hz: number };
export interface PlaybackController {
  initialState?: { status: PlaybackStatus; tickRateHz: number };
  commandSink?: (cmd: PlaybackCommand) => void; // provided by @net later
}
```

Example (wired):

```tsx
<PlayControls controller={{
  ...usePlaybackNetController(),
}} />
```

## Net Wiring

- Hook: `src/hud/hooks/use-playback-controller.ts`
- Actions used:
  - `play` → `simulation.start` with `{ tick_rate }`
  - `resume` → `simulation.resume` with `{}`
  - `stop` → `simulation.stop` with `{}`
  - `setTickRate` → `tick_rate.update` with `{ tick_rate }`
  - `pause` is local-only (no server action)

The hook calls `net.connect()` on mount and sends actions via `net.sendAction(...)`. UI remains optimistic; errors are logged for now.

## Implementation Notes

- Local state for `status` and `tickRateHz`; slider drags are previewed and committed on release.
- Tick rate persisted to `localStorage` (`hud:tickRateHz`).
- No side effects beyond calling `commandSink` if provided.

## Performance

- Lightweight React component; no timers or subscriptions; minimal re-renders.

