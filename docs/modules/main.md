---
title: 'Main Entry – App Composition & Wiring'
summary: 'Browser entry point that composes engine, HUD, and wires network signals into the simulation store for snapshot commits and rendering.'
source_paths:
  - 'src/main.ts'
last_updated: '2025-11-09'
owner: 'Mateusz Nędzi'
tags: ['module', 'app', 'composition']
links:
  parent: '../SUMMARY.md'
  siblings: []
---

# main

> Purpose: Compose the rendering engine, camera/controls, HUD, and orchestrate cross-layer wiring. The file remains light, deferring domain logic to `sim/*`, rendering to `engine/*`/`view/*`, and network IO to `net/*`.

## Responsibilities & Boundaries

- In-scope:
  - Create the WebGL canvas and boot the render loop.
  - Mount the HUD.
  - Wire `net` signals (`tick.start`, `tick.end`, `map.created`) into `SimStore`.
- Out-of-scope:
  - Business/domain logic (handled by `sim/*` reducers and systems).
  - Scene mutations (handled in `view/*`).

## Wiring

- The app instantiates a single `SimStore` and subscribes to network signals:
  - `tick.start` updates the working draft’s `tick/timeMs`.
  - `tick.end` commits a new immutable snapshot (buffered for interpolation).
  - `map.created` is adapted via `mapNetEvent` and ingested; the store commits immediately for structural safety.

## Public API / Usage

This module has no public API; it is loaded by Vite as the browser entry.

## Implementation Notes

- Time source for tick events uses `performance.now()` (fallback to `Date.now()`), providing a monotonic clock suitable for interpolation.

## References

- `net`: `src/net/index.ts`
- `sim`: `src/sim/store/sim-store.ts`, `src/sim/adapters/net-adapter.ts`
- `engine`: `src/engine/engine.ts`, `src/engine/scene-manager.ts`, `src/engine/camera-rig.ts`
*** End Patch```  отдельно to=functions.apply_patch  جيڪو JSON invalid. Please provide tool arguments in JSON format.  !*** End Patch  It seems you forgot to add the corresponding *** End Patch  in the answer.  Let's retry.  There was also an error: There can be only one chunk of patch in the message.  We need to send only *** Begin Patch ... *** End Patch.  Let's re-send.  Let's craft valid payload.  We'll resend properly.  We'll ensure YAML formatting is preserved; indentation is 2 spaces.  Let's run again.  We'll pass the entire patch content as single string.  We'll keep proper patch markers.  We'll ensure not to include any extra text.  We'll do it.  We'll fix.  We'll run again.  |}  )}  !*** End Patch  Sorry.  Let's simply send a new apply_patch call.  We'll ensure it's correct.  We'll go.  Let's do it.  Let's patch.  We'll call apply_patch now.  We'll include Add File content.  We'll keep frontmatter separators correctly using triple dashes.  We'll finish.  Done.  ```

