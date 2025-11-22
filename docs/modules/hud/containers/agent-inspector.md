---
title: 'Agent Inspector'
summary: 'A debug panel for inspecting individual agents in the simulation. Allows selection from a list and displays real-time state details fetched from the backend.'
source_paths:
  - 'src/hud/containers/agent-inspector.tsx'
last_updated: '2025-11-22'
owner: 'Mateusz Nędzi'
tags: ['module', 'hud', 'debug', 'agent']
links:
  parent: '../index.md'
  siblings:
    - './net-events.md'
    - './play-controls.md'
---

# Agent Inspector

> **Purpose:** To provide a developer-focused view of individual agent states by querying the backend on demand.

## Context & Motivation

- **Problem:** Debugging agent behavior requires visibility into their internal state (position, route, cargo, etc.), which is often too complex to show in the main viewport or log stream.
- **Solution:** A dedicated panel that lists available agents and fetches full state details for a selected agent using the `agent.describe` API.

## Responsibilities & Boundaries

- **In-scope:**
  - Fetching and displaying the list of active agents (`agent.list`).
  - Fetching and displaying detailed state for a selected agent (`agent.describe`).
  - Auto-refreshing the list on mount.
  - JSON-formatted display of agent data.
- **Out-of-scope:**
  - Modifying agent state (read-only).
  - Real-time streaming updates (uses request/response model, though manual refresh is possible).

## Architecture & Design

- **Component:** `AgentInspector` is a React functional component wrapped in `HudContainer`.
- **Data Access:** Uses the global `net` client to send `agent.list` and `agent.describe` actions.
- **State Management:** Local component state for the agent list, selection, and fetched details.

### Data Flow

1.  **Mount:** Calls `net.sendAction('agent.list', {})`.
2.  **Selection:** User selects an ID from the dropdown -> updates local `selectedId`.
3.  **Fetch:** `useEffect` triggers `net.sendAction('agent.describe', { agent_id })` -> updates `detail` state.
4.  **Render:** Displays `detail` as a formatted JSON block.

## Public API / Usage

Mounted within `src/hud/index.tsx` as part of the `SimulationPanels` group.

```tsx
// src/hud/index.tsx
{isVisible('agent-inspector') && <AgentInspector />}
```

## Implementation Notes

- **Dropdown:** Uses `src/hud/ui/select` for a consistent look.
- **Network:** Direct usage of `net.sendAction` ensures we get the latest state from the backend.
- **Error Handling:** Catches and logs errors during fetch; displays "No data" or loading states in UI.

## Future Improvements

- Add auto-refresh toggle for real-time monitoring.
- Add filtering by agent kind (truck vs. building).
- Visualize agent route on the map when selected.
