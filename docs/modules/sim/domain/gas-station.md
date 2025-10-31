---
title: 'Gas Station'
summary: 'Extends building semantics with refuelling capacity, enabling future fuel logistics systems.'
source_paths:
  - 'src/sim/domain/gas-station.ts'
last_updated: '2025-10-31'
owner: 'Mateusz Nędzi'
tags: ['module', 'sim', 'domain', 'facility']
links:
  parent: '../../SUMMARY.md'
  siblings:
    ['./building.md', './truck.md']
---

# Gas Station

> **Purpose:** Represent fueling points that trucks can occupy, exposing refuel capacity metrics to later systems.

## Context & Motivation

- Future fuel-consumption models need to know which nodes can replenish trucks; this class keeps it pure and serialisable.

## Responsibilities & Boundaries

- In-scope: storing capacity and leveraging base building truck membership.
- Out-of-scope: actual fuel transfer logic; that belongs to systems operating each tick.

## References

- [Truck](./truck.md)
- [Building Base](./building.md)

