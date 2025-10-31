---
title: 'Agent'
summary: 'Represents human or autonomous operators assigned to trucks, enabling future decision systems.'
source_paths:
  - 'src/sim/domain/agent.ts'
last_updated: '2025-10-31'
owner: 'Mateusz Nędzi'
tags: ['module', 'sim', 'domain', 'fleet']
links:
  parent: '../../SUMMARY.md'
  siblings:
    ['./truck.md', './node.md']
---

# Agent

> **Purpose:** Track operators and their truck assignments without imposing behaviour, letting higher-level systems resolve work allocation.

## Context & Motivation

- Not every truck is autonomous; mapping agents to fleets supports scheduling algorithms and training overlays later.

## Responsibilities & Boundaries

- In-scope: immutable ID and optional assigned truck reference, helper to reassign.
- Out-of-scope: behaviour trees, UI presence.

## References

- [Truck](./truck.md)
- [Simulation State Helpers](../state.md)

