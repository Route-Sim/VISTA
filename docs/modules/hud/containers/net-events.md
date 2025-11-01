---
title: "HUD: Net Events Panel"
summary: "Top-left HUD panel showing real-time WebSocket telemetry: connection lifecycle, incoming signals, and outgoing actions with filters and expandable details."
source_paths:
  - "src/hud/containers/net-events.tsx"
  - "src/hud/components/hud-container.tsx"
  - "src/hud/hooks/use-hud-hotkeys.ts"
  - "src/hud/state/hud-visibility.tsx"
last_updated: "2025-11-01"
owner: "Mateusz Nędzi"
tags: ["hud", "ui", "telemetry", "net"]
links:
  parent: "../../../SUMMARY.md"
  siblings: []
---

# Net Events Panel

> Purpose: Provide an always-available diagnostic view into WebSocket activity. Useful during development and demos to confirm message flow and connection health.

## Context & Motivation

- Need visibility into both directions (incoming/outgoing) and connection phases (connecting/open/close/error).
- Must align with IO → Domain → View: panel only observes telemetry; it never mutates domain or protocol state.

## Responsibilities & Boundaries

- Reads the `netTelemetry` bus and renders a scrollable list with filters (Incoming, Outgoing, Conn).
- Expandable details show raw text or decoded envelopes.
- Does not send actions or modify network state.

## Architecture & Design

- Renders inside `HudContainer` with `id: 'net-events'`, anchored `top-4 left-4`.
- Subscribes to a single `event` channel and maintains a local ring buffer (last 500 events).
- Hotkey `N` toggles visibility via `useHudHotkeys` and `useHudVisibility`.

## Public API / Usage

```tsx
import { NetEventsPanel } from '@/hud/containers/net-events';
// Mounted in `src/hud/index.tsx`; toggle via HUD menu or press "N".
```

## Implementation Notes

- Autoscrolls when near the end; pauses autoscroll if user scrolls up.
- Keeps rows compact to reduce overlap with other panels.

## References

- `src/net/telemetry.ts`
- `src/hud/components/hud-container.tsx`
- `src/hud/state/hud-visibility.tsx`
- `src/hud/index.tsx`


