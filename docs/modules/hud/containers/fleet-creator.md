---
title: 'Fleet Creator'
summary: 'Truck creation panel that collects agent parameters, dispatches `agent.create`, and renders a live manifest of incoming `agent.created` signals.'
source_paths:
  - 'src/hud/containers/fleet-creator.tsx'
last_updated: '2025-11-09'
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

> **Purpose:** Provide a warm, form-driven workflow for defining truck agents before the simulation starts, send the corresponding `agent.create` action, and surface the resulting `agent.created` payloads in a manifest for quick verification.

## Context & Motivation

- Gives operators a pre-flight surface to spin up a delivery fleet alongside map creation.
- Only available while the playback state is `idle` or `stopped`, matching the map creator workflow.
- Bridges HUD → net: the HUD gathers intent, the net layer issues actions, the manifest reflects the authoritative response from the server.

## Responsibilities & Boundaries

- In-scope: Truck UUID + max-speed form, dispatch of `agent.create`, live manifest fed by `agent.created`.
- Out-of-scope: Server-side validation/business rules, simulation state transitions, three.js scene updates (handled by view/engine).

## Architecture & Design

- Wrapper: `HudContainer` (`closable={false}`) ensures consistent chrome and respects HUD visibility toggles.
- Form controls: shadcn `Input`, `Slider`, `Button`.
- State:
  - `form`: `{ agentId, maxSpeedKph }`
  - `createdTrucks`: `Extract<SignalData['agent.created'], { kind: 'truck' }>[]`
  - Feedback: `errorMessage`, `statusMessage`, `highlightId`
- Data flow:
  1. User generates/edits the UUID + speed → submits.
  2. HUD calls `net.sendAction('agent.create', params)`; awaits either `agent.created` or `error`.
  3. `net.on('agent.created', handler)` pushes trucks into the manifest, limited to the 32 most recent entries.
  4. Highlight timer (~3.5 s) emphasizes the latest truck.
- Layout: top form card, bottom manifest card with `ScrollArea` for overflow, count badge summarizing tracked trucks.
- Palette: high-opacity warm whites and subtle orange highlight align with the low-poly warm world guidance.

### UI Snapshot

- Form shows live slider readout, numeric input backup, and a “New UUID” button for quick regeneration.
- Manifest surfaces current vs. max speed, location indices, destination, route length, inbox/outbox counts, and progress in metres.
- Empty state communicates readiness when no trucks have been created.

## Algorithms & Complexity

- Manifest update: deduplication performs a linear scan across at most 32 tracked trucks (O(n) with n ≤ 32). The cap keeps re-render cost bounded.
- UUID generation: `crypto.randomUUID()` (or fallback template) runs in constant time per submission.
- Highlight timer: a single timeout handle; no interval churn.

## Public API / Usage

```tsx
import { FleetCreator } from '@/hud/containers/fleet-creator';

<FleetCreator />
```

## Implementation Notes

- `canCreate` is derived from `usePlaybackState`; button disables outside idle/stopped states.
- `net.sendAction` returns the matching signal or `error`; success message appears even though the manifest already updates via the subscription.
- UUIDs come from `crypto.randomUUID()` with a template fallback for older browsers; the form auto-refreshes the ID after each successful creation.
- `clamp` ensures max speed stays within [10, 140] km/h and degrades gracefully when the user clears numeric input.
- Manifest deduplicates trucks by ID; repeated signals bubble the truck back to the top.
- Highlight uses a `setTimeout`; cleaned up on unmount to avoid leaking timers.
- Styling leans on warm whites and light orange borders to respect the Low‑Poly Warm World palette.
- Layout applies `flex` + `min-h-0` on the container and `flex-1` on the manifest `ScrollArea` so overflow scrolls inside the card rather than making the HUD column grow.

## Tests (If Applicable)

- Manual smoke test: 1) open HUD while idle, 2) create a truck, 3) observe manifest entry and highlight, 4) confirm `agent.created` telemetry in Net Events panel.
- Future scope: Vitest coverage for `nextAgentId` helper and form validation.

## Performance

- Manifest capped to 32 entries avoids large array churn; ScrollArea virtualisation unnecessary.
- Only re-renders when form state or incoming signal changes.
- Slider and number input share state, reducing double-binding overhead.

## Security & Reliability

- Requires simulation idle/stopped to avoid conflicting lifecycle transitions.
- Displays server-side `error` responses verbatim to operators.
- Cleans up highlight timers and network subscriptions on unmount.

## References

- Parent: [`../index.md`](../index.md)
- Sibling: [`./map-creator.md`](./map-creator.md)
- Protocol: [`../../net/protocol/schema.md`](../../net/protocol/schema.md)
- API Reference: [`../../../api-reference.md`](../../../api-reference.md)
- State: [`../state/playback-state.md`](../state/playback-state.md)
