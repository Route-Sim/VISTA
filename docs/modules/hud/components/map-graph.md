---
title: 'HUD Graph – Map Graph'
summary: 'Canvas-based 2D graph renderer for the generated map with a warm, low‑poly friendly aesthetic, including a legend and pan/zoom interactions.'
source_paths:
  - 'src/hud/components/map-graph.tsx'
last_updated: '2025-11-08'
owner: 'Mateusz Nędzi'
tags: ['module', 'hud', 'react', 'canvas', 'ui', 'visualization']
links:
  parent: '../../index.md'
  siblings:
    - '../containers/map-creator.md'
    - '../../net/protocol/schema.md'
---

# HUD Graph – Map Graph

> Purpose: Render the `map.created` graph (nodes and edges) in a warm, readable canvas overlay that supports panning and zooming, with a clear legend for road classes.

## Context & Motivation

The HUD needs a lightweight, reusable 2D graph renderer for previewing generated maps before the simulation starts. `react-konva` provides immediate mode drawing with good performance and simple interaction handling.

## Responsibilities & Boundaries

- In-scope: 2D rendering of nodes/edges, legend, pan/zoom, fit-to-container layout, and warm palette styling.
- Out-of-scope: Domain conversion, three.js scene mutation (handled in `view/*`), and networking (handled in `net/*`).

## Architecture & Design

- Component: `MapGraph` accepts `data: SignalData['map.created']`.
- Layout:
  - Fit graph into its container with padding.
  - Keep aspect ratio; center the content.
  - Pan by dragging; zoom with mouse wheel (toward cursor).
- Styling:
  - Warm palette; stroke widths scale with `lanes`.
  - Nodes are small circles; edges are rounded lines.
  - Legend explains road classes and node representation.
  - Overlay displays counts: nodes, edges, and sites.

## Public API / Usage

```tsx
import { MapGraph } from '@/hud/components/map-graph';
import type { SignalData } from '@/net';

function Panel({ data }: { data: SignalData['map.created'] }) {
  return <MapGraph data={data} />;
}
```

## Implementation Notes

- Canvas: `react-konva` + `konva`.
- Interactions:
  - Pan: drag the stage.
  - Zoom: wheel to/from the cursor point.
- Accessibility:
  - Legend has an aria-label.
  - Text overlays keep small footprint and high legibility.

## References

- Container: [`../containers/map-creator.md`](../containers/map-creator.md)
- Protocol: [`../../net/protocol/schema.md`](../../net/protocol/schema.md)


