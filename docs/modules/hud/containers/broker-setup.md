---
title: 'Broker Setup'
summary: 'Broker agent creation panel that collects agent parameters, dispatches `agent.create`, and renders a live manifest of incoming broker `agent.created` signals.'
source_paths:
  - 'src/hud/containers/broker-setup.tsx'
last_updated: '2025-12-13'
owner: 'Mateusz Nędzi'
tags: ['module', 'hud', 'react', 'ui', 'container']
links:
  parent: '../index.md'
  siblings:
    - './map-creator.md'
    - './fleet-creator.md'
    - './start-simulation.md'
    - './play-controls.md'
    - './camera-help.md'
---

# Broker Setup

> **Purpose:** Provide a form-driven workflow for defining broker agents before the simulation starts, send the corresponding `agent.create` action with `agent_kind: 'broker'`, and surface the resulting `agent.created` payloads in a manifest for quick verification.

## Context & Motivation

- Brokers act as intermediaries in the logistics simulation, managing orders and coordinating between trucks and delivery sites.
- Only available while the playback state is `idle` or `stopped`, matching the map creator and fleet creator workflow.
- Accessible via the main tabbed interface in CreatorPanels alongside Map, Fleet, and Simulation tabs.
- Bridges HUD → net: the HUD gathers intent, the net layer issues actions, the manifest reflects the authoritative response from the server.

## Responsibilities & Boundaries

- In-scope: Broker UUID and initial balance configuration, dispatch of `agent.create` with `agent_kind: 'broker'`, live manifest fed by `agent.created`.
- Out-of-scope: Server-side validation/business rules, broker behavior logic, simulation state transitions, three.js scene updates.

## Architecture & Design

- Wrapper: `HudContainer` (`closable={false}`) ensures consistent chrome and respects HUD visibility toggles.
- Form controls: shadcn `Input`, `Button`.
- State:
  - `form`: `{ agentId, balanceDucats }`
  - `createdBrokers`: `Extract<SignalData['agent.created'], { kind: 'broker' }>[]`
  - Feedback: `errorMessage`, `highlightId`
- Data flow:
  1. User generates/edits the UUID and sets initial balance → submits.
  2. HUD calls `net.sendAction('agent.create', params)` with `agent_kind: 'broker'`; awaits either `agent.created` or `error`.
  3. `net.on('agent.created', handler)` filters for `kind === 'broker'` and pushes into the manifest, limited to 32 entries.
  4. Highlight timer (~3.5 s) emphasizes the latest broker.
- Layout: top form card, bottom manifest card with `ScrollArea` for overflow, count badge summarizing tracked brokers.
- Palette: high-opacity warm whites and subtle orange highlight align with the low-poly warm world guidance.

### Broker Parameters

| Parameter | Type | Range | Default | Description |
|-----------|------|-------|---------|-------------|
| `agentId` | string | UUID | auto-generated | Unique identifier for the broker |
| `balanceDucats` | number | ≥0 | 10000 | Starting funds for the broker |

### UI Snapshot

- Form shows UUID input with "New UUID" button for quick regeneration.
- Balance input accepts any non-negative value.
- Manifest surfaces broker ID, balance, inbox count, and outbox count.
- Empty state communicates readiness when no brokers have been created.

## Algorithms & Complexity

- Manifest update: deduplication performs a linear scan across at most 32 tracked brokers (O(n) with n ≤ 32).
- UUID generation: `crypto.randomUUID()` (or fallback template) runs in constant time per submission.
- Highlight timer: a single timeout handle; no interval churn.

## Public API / Usage

```tsx
import { BrokerSetup } from '@/hud/containers/broker-setup';

<BrokerSetup className="h-full" />
```

The component is rendered via the tabbed `CreatorPanels` in `src/hud/index.tsx`.

## Implementation Notes

- `canCreate` is derived from `usePlaybackState`; button disables outside idle/stopped states.
- `net.sendAction` returns the matching signal or `error`.
- UUIDs come from `crypto.randomUUID()` with a template fallback for older browsers.
- Form auto-refreshes the ID after each successful creation.
- Manifest deduplicates brokers by ID; repeated signals bubble the broker back to the top.
- Highlight uses a `setTimeout`; cleaned up on unmount to avoid leaking timers.
- Styling follows the Low‑Poly Warm World palette with warm whites and light orange highlights.

## Tests (If Applicable)

- Manual smoke test: 1) open HUD while idle, 2) switch to Broker tab, 3) create a broker, 4) observe manifest entry and highlight, 5) confirm `agent.created` telemetry in Net Events panel.
- Future scope: Vitest coverage for form validation.

## Performance

- Manifest capped to 32 entries avoids large array churn.
- Only re-renders when form state or incoming signal changes.

## Security & Reliability

- Requires simulation idle/stopped to avoid conflicting lifecycle transitions.
- Displays server-side `error` responses verbatim to operators.
- Cleans up highlight timers and network subscriptions on unmount.

## References

- Parent: [`../index.md`](../index.md)
- Sibling: [`./fleet-creator.md`](./fleet-creator.md)
- Sibling: [`./map-creator.md`](./map-creator.md)
- Sibling: [`./start-simulation.md`](./start-simulation.md)
- Protocol: [`../../net/protocol/schema.md`](../../net/protocol/schema.md)
- API Reference: [`../../../api-reference.md`](../../../api-reference.md)
- State: [`../state/playback-state.md`](../state/playback-state.md)
