---
title: 'SimStore and Snapshot Buffer'
summary: 'Event-driven store that accumulates per-entity updates between ticks and commits immutable snapshots into a ring buffer for view interpolation.'
source_paths:
  - 'src/sim/store/sim-store.ts'
  - 'src/sim/store/snapshot-buffer.ts'
  - 'src/sim/store/snapshot.ts'
  - 'src/sim/events.ts'
last_updated: '2025-11-09'
owner: 'Mateusz Nędzi'
tags: ['module', 'sim', 'store', 'events']
links:
  parent: '../../../SUMMARY.md'
  siblings: []
---

# SimStore and Snapshot Buffer

> Purpose: Provide an immutable, versioned simulation timeline. The store ingests ordered events (`tick → updates* → tick → …`), applies updates to a working draft, and commits a new frozen `SimSnapshot` on each `tick`. The `SnapshotBuffer` retains recent snapshots for time-based interpolation in `view/*`.

## Architecture & Data Flow

- `SimStore.ingest(evt)` applies reducers to a mutable working draft unless `evt.type === "tick"`.
- `SimStore.commitTick(tick, timeMs?)` freezes the draft, pushes it to `SnapshotBuffer`, and clones it as the new draft.
- `SnapshotBuffer.getBracketing(timeMs)` returns `{a, b, alpha}` for rendering interpolation.

## Public API (essential)

```ts
class SimStore {
  ingest(evt: SimEvent): void;
  commitTick(tick: number, timeMs?: number): SimSnapshot;
  getWorkingDraft(): SimDraft;
  getBuffer(): SnapshotBuffer;
}
```

## Implementation Notes

- Tick lifecycle:
  - The server emits `tick.start` and `tick.end`. The store updates the working draft’s `tick/timeMs` on `tick.start` and commits a new immutable snapshot on `tick.end`.

## Performance & Reliability

- Snapshots are shallow-frozen to prevent accidental mutations.
- Reducers replace entity objects instead of mutating them.
- Buffer enforces monotonic `tick` and `timeMs`.

## Related

- `reducers.md` for reducer registry and event handling
- `entities.md` for domain shapes
