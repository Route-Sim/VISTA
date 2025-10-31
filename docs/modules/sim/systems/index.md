---
title: 'Simulation Systems Overview'
summary: 'Outlines the functional pipeline that will evolve into per-tick simulation logic.'
source_paths:
  - 'src/sim/systems/index.ts'
last_updated: '2025-10-31'
owner: 'Mateusz Nędzi'
tags: ['module', 'sim', 'systems']
links:
  parent: '../../SUMMARY.md'
  siblings:
    ['./advance.md']
---

# Simulation Systems Overview

> **Purpose:** Provide a single entry point for tick systems, keeping composition concerns isolated from store wiring.

## Context & Motivation

- Systems will incrementally evolve; exposing them through a barrel simplifies registration in `main.ts` later.

## References

- [Advance Pipeline](./advance.md)

