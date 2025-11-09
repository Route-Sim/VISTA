---
title: 'App Colors'
summary: 'Centralized warm-world palette exporting semantic color tokens for background, ground, lighting, and graph primitives used across engine and view modules.'
source_paths:
  - 'src/app/colors.ts'
last_updated: '2025-11-09'
owner: 'Mateusz Nędzi'
tags: ['module', 'app', 'style']
links:
  parent: '../../SUMMARY.md'
  siblings: []
---

# App Colors

> Purpose: Define the warm, low-poly palette shared between engine lighting, ground materials, and view-layer primitives. The module keeps values numeric and framework-agnostic so both three.js materials and HUD styling can reference them safely.

## Context & Motivation

- Problem solved: avoids duplicated hex literals across engine/view.
- Requirements and constraints:
  - Pure data module (no three.js imports) to respect IO → Domain → View layering.
  - Semantic names indicate usage (background, ground, graph primitives, lights).
- Dependencies and assumptions:
  - Colors feed into three.js materials created under `engine/objects` and lighting inside `scene-manager`.

## Responsibilities & Boundaries

- In-scope:
  - Export `Colors` record with typed hex values.
  - Provide `getColor(key)` helper for convenience.
- Out-of-scope:
  - Material creation or runtime theming (handled elsewhere).
  - HUD Tailwind tokens (defined in their own layer).

## Architecture & Design

- Data-only module using `ColorHex` alias for readability.
- `Colors` constant marked `as const` to preserve literal types for downstream inference.

## Algorithms & Complexity

- Constant lookup O(1).

## Public API / Usage

```start:Colors:src/app/colors.ts
export const Colors = {
  background: 0xf2f2f2,
  fog: 0xf2f2f2,
  ground: 0x4da167,
  graphNode: 0xffb36b,
  graphRoad: 0x5f4b32,
  lightAmbient: 0xffe8cc,
  lightPoint: 0xff9b5e,
} as const;
```

- `getColor('graphNode')` returns the warm cylinder tint for nodes.

## Implementation Notes

- Colors align with the Low-Poly Warm World style guide: warm creams/oranges offset by muted greens and browns.
- Additional semantic tokens should follow the same pattern; avoid raw literals elsewhere.

## References

- `docs/style-guide.md`
- `src/engine/scene-manager.ts`
- `src/engine/objects/graph-primitives.ts`
- `src/view/graph/graph-view.ts`
