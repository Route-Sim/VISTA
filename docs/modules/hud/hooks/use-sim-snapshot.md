---
title: "Use Sim Snapshot"
summary: "React hooks for accessing simulation data reactively."
source_paths:
  - "src/hud/hooks/use-sim-snapshot.ts"
  - "src/hud/hooks/use-selected-object.ts"
last_updated: "2025-11-23"
owner: "Mateusz Nędzi"
tags: ["hud", "hooks", "sim-store"]
links:
  parent: "../../SUMMARY.md"
  siblings:
    - "../state/sim-context.md"
---

# Use Sim Snapshot Hooks

> **Purpose:** Custom hooks that bridge the imperative `SimStore` with declarative React components.

## Hooks

### `useSimSnapshot()`

- **Returns:** `SimSnapshot` (latest committed tick).
- **Behavior:** Subscribes to `SimStore` and triggers a re-render whenever a new tick is committed.

### `useSelectedObject()`

- **Returns:** `{ id, type, object }`
- **Behavior:**
  1. Reads current selection from `FocusState`.
  2. Reads current snapshot from `useSimSnapshot`.
  3. Lookups the object in the snapshot based on ID and Type.
  4. Returns `null` object if not found (or if type is visual-only like Tree, returns placeholder structure).

## Usage

```ts
const { object } = useSelectedObject();

if (object?.kind === 'agent') {
  console.log(object.data.currentSpeed);
}
```

