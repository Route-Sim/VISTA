---
title: 'HUD: Camera Help'
summary: 'Compact, accessible guide to camera and movement controls for the orbit+move rig. Uses KeyCap styling and simple layout.'
source_paths:
  - 'src/hud/containers/camera-help.tsx'
  - 'src/hud/components/key-cap.tsx'
last_updated: '2025-11-01'
owner: 'Mateusz Nędzi'
tags: ['module', 'hud', 'ui']
links:
  parent: '../../../SUMMARY.md'
  siblings: ['../play-controls.md']
---

# Camera Help

> Purpose: Provide an unobtrusive reference for movement (WASD, Space/Shift) and camera (orbit/pan/zoom) controls.

## Layout

- Small `HudContainer` with a concise list of mappings.
- Caption: “Press H to hide/show HUD”.

## Notes

- Mirrors the current orbit+move implementation in `src/engine/controls/orbit-move-controls.ts`.

