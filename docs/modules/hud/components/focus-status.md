---
title: "Focus Status"
summary: "HUD component displaying the currently focused object and allowing deselection."
source_paths:
  - "src/hud/components/focus-status.tsx"
last_updated: "2025-11-23"
owner: "Mateusz Nędzi"
tags: ["hud", "ui", "component", "focus"]
links:
  parent: "../../SUMMARY.md"
  siblings:
    - "../state/focus-state.md"
---

# Focus Status

> **Purpose:** visually indicates which object is currently selected and provides a way to clear the selection.

## Context & Motivation

- **Problem:** Users need feedback when they click an object, and a way to dismiss the selection.
- **Solution:** A floating card in the HUD showing the focused object's type and ID.

## Responsibilities & Boundaries

- **In-scope:** Rendering current focus state, handling "unfocus" button click.
- **Out-of-scope:** Modifying the state logic (handled by store).

## Architecture & Design

- **Component:** React functional component.
- **State:** Consumes `useFocusState`.
- **Styling:** Uses shared UI components (`Card`, `Button`) with a floating pill design.

## Public API / Usage

```tsx
import { FocusStatus } from "@/hud/components/focus-status";

// In HUD layout
<FocusStatus />
```

