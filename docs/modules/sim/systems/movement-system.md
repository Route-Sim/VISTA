---
title: "Movement System"
summary: "Describes the domain-level movement system responsible for advancing trucks along road edges based on speed, elapsed time, and simulation speed, including clamping at edge ends and preparing for route transitions."
source_paths:
  - "src/sim/systems/movement-system.ts"
last_updated: "2025-11-27"
owner: "Mateusz Nędzi"
tags: ["module", "sim", "systems", "movement", "domain"]
links:
  parent: "../../../SUMMARY.md"
  siblings: []
---

# Movement System

> **Purpose:** The movement system advances trucks along road edges in the domain snapshot according to their current speed, the elapsed wall-clock time, and the global simulation speed factor. It is a pure, deterministic system that updates edge progress, clamps movement to edge lengths, and exposes enough state for higher-level route management without performing any side effects.

## Context & Motivation

- **Problem solved:** Given a snapshot of the simulation state and a time delta, we need to consistently and deterministically compute how far each truck moves along its current road segment.
- **Requirements and constraints:**
  - Operate purely within `sim/*` without any three.js or rendering concerns.
  - Use physical units (speed in km/h, edge lengths in meters) with clear, consistent conversions.
  - Respect a global simulation speed multiplier (`draft.config.speed`) to support fast-forward and slow-motion playback.
  - Avoid implicit side effects such as route planning or server-driven state changes; those are handled elsewhere.
- **Dependencies and assumptions:**
  - Roads are stored in `draft.roads` with `lengthM` and, optionally, `endNodeId`.
  - Trucks are stored in `draft.trucks` with `currentEdgeId`, `currentSpeed`, and `edgeProgress` at minimum.
  - Route arrays and node transitions are orchestrated by higher-level systems; the movement system only provides local motion and clamping.

## Responsibilities & Boundaries

- **In-scope:**
  - Convert truck speed and elapsed time into a distance traveled on the current edge.
  - Increment `edgeProgress` according to this distance.
  - Clamp `edgeProgress` to the length of the current road.
  - When the end of the edge is reached and `endNodeId` is present, set `currentNodeId` to that node and reset `currentSpeed` to zero.
- **Out-of-scope:**
  - Creating, removing, or re-routing trucks.
  - Selecting or switching `currentEdgeId` to follow multi-edge routes (handled by other systems or server snapshots).
  - Any rendering, interpolation, or three.js scene updates.
  - Network IO, logging, or telemetry side effects.

## Architecture & Design

- **Key class:**
  - `MovementSystem` exposes a single method:
    - `update(draft: SimDraft, deltaTimeMs: number): void`
- **Data flow and interactions:**
  - `update` reads the simulation speed from `draft.config.speed` (defaulting to `1.0`).
  - It iterates over all trucks in `draft.trucks` and calls an internal helper to update each truck.
  - The helper:
    - Early-returns if `deltaTimeMs <= 0`, there is no `currentEdgeId`, or `currentSpeed <= 0`.
    - Looks up the current road in `draft.roads` and returns if it is missing.
    - Computes the distance traveled in meters:
      - \( \text{speed\_mps} = \text{currentSpeed} / 3.6 \)
      - \( \text{time\_s} = (\text{deltaTimeMs} / 1000) \times \text{simSpeed} \)
      - \( \text{distance\_m} = \text{speed\_mps} \times \text{time\_s} \)
    - Increments `edgeProgress` by `distance_m` and clamps it so that `edgeProgress <= road.lengthM`.
    - If clamping occurs and the truck has reached `road.lengthM`, it assigns `currentNodeId` to the road's `endNodeId` (if present) and stops the truck by setting `currentSpeed` to `0`.
- **State management:**
  - All updates are performed directly on the `SimDraft` object passed into `update`, which is assumed to be produced by an immer-like drafting layer.
  - No internal mutable state is kept on `MovementSystem`; it can be safely re-used across frames or re-instantiated per test.

## Algorithms & Complexity

- **Core algorithmic approach:**
  - Simple linear motion along one dimension (edge distance) using constant speed per frame.
  - Clamp at the edge boundary rather than wrapping or extrapolating.
- **Complexity:**
  - Time complexity is \( O(T) \) per call, where \( T \) is the number of trucks in `draft.trucks`.
  - Space complexity is \( O(1) \) beyond the existing `draft`.
- **Edge cases and stability:**
  - Zero or negative `deltaTimeMs` yields no updates.
  - Missing `currentEdgeId`, zero or negative `currentSpeed`, or missing road information also result in no changes.
  - Overshooting the edge due to large `deltaTimeMs` is safely clamped.

## Public API / Usage

- **Signature:**

```ts
const system = new MovementSystem();
system.update(draft, deltaTimeMs);
```

- **Example usage (simplified):**

```ts
const system = new MovementSystem();
const draft = createEmptySnapshot();

// Setup one road and one truck
draft.roads[roadId] = { id: roadId, lengthM: 1000, endNodeId } as any;
draft.trucks[truckId] = {
  id: truckId,
  currentEdgeId: roadId,
  currentSpeed: 80,
  edgeProgress: 0,
} as any;

// Advance movement by 1 second
system.update(draft, 1000);
```

## Implementation Notes

- **Design trade-offs:**
  - The system is intentionally conservative: it only moves along the current edge and does not attempt to infer or mutate higher-level route state (e.g., advancing to the next edge in a route). This keeps the system predictable and fully testable.
  - Clamping at the end of the edge and assigning `currentNodeId` when available gives higher-level systems enough information to trigger route transitions externally.
- **Libraries and environment:**
  - Written in TypeScript and integrated into the `sim` domain layer.
  - Tested with Vitest alongside other simulation systems.
- **Testing hooks:**
  - Unit tests exercise:
    - Zero-time updates.
    - Movement along a single edge.
    - Clamping behavior and end-node assignment.

## Tests (If Applicable)

- Located under `tests/sim/systems/movement-system.test.ts`.
- Cover:
  - No-op behavior when `deltaTimeMs <= 0`.
  - Movement along a single edge based on known speed and time.
  - Clamping at the end of an edge and assigning `currentNodeId`.

## Performance

- Designed to scale linearly with the number of trucks.
- The arithmetic involved is minimal (a few multiplies and additions per truck), making it suitable for per-frame updates even with many agents.

## Security & Reliability

- The system does not perform IO or handle untrusted data directly; it operates on already-validated domain snapshots.
- Validation of incoming messages and construction of `SimDraft` occur in adapters and store layers, which must ensure unit consistency and type safety.

## References

- `src/sim/store/snapshot.ts` — snapshot structure and drafting.
- `src/sim/domain/entities.ts` — truck and road domain entities.
- `src/sim/systems/interpolation.ts` — related time-based domain system.


