---
title: "Sim Store Context"
summary: "React Context provider for accessing the Simulation Store throughout the HUD component tree."
source_paths:
  - "src/hud/state/sim-context.tsx"
last_updated: "2025-11-23"
owner: "Mateusz Nędzi"
tags: ["hud", "context", "sim-store", "react"]
links:
  parent: "../../SUMMARY.md"
  siblings:
    - "../../sim/store/sim-store.md"
---

# Sim Store Context

> **Purpose:** Makes the `SimStore` instance available to any React component in the HUD without prop drilling.

## Context & Motivation

- **Problem:** Deeply nested HUD components (like `FocusInspector`) need access to the simulation state, but `SimStore` is created in `main.ts`.
- **Solution:** A standard React Context Provider pattern.

## Responsibilities & Boundaries

- **In-scope:** Holding the `SimStore` reference.
- **Out-of-scope:** Managing state updates or subscriptions (handled by the store itself and consumers).

## Public API / Usage

```tsx
// Wrap root
<SimStoreProvider store={simStore}>
  <App />
</SimStoreProvider>

// Consume in component
const store = useSimStore();
```

