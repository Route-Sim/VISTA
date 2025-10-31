---
title: 'Truck'
summary: 'Describes mobile assets with capacity, fuel state, carried packages, and environmental telemetry.'
source_paths:
  - 'src/sim/domain/truck.ts'
last_updated: '2025-10-31'
owner: 'Mateusz Nędzi'
tags: ['module', 'sim', 'domain', 'fleet']
links:
  parent: '../../SUMMARY.md'
  siblings: ['./road.md', './package.md', './agent.md']
---

# Truck

> **Purpose:** Represent fleet vehicles in the simulation, exposing immutable operations for speed, fuel, and package manifest changes.

## Context & Motivation

- Trucks are central to logistics KPIs. Maintaining them as immutable objects enables snapshot buffers to compare frames cheaply.

## Responsibilities & Boundaries

- In-scope: capacity metadata, package membership, speed/fuel adjustments, CO₂ tracking.
- Out-of-scope: routing, collision avoidance, or fuel burn—future systems mutate state by producing new `Truck` instances.

## Architecture & Design

- Constructor defaults fuel state to full and speed to zero for freshly spawned vehicles.
- Helper methods (`withSpeed`, `withFuel`, `addPackage`) always produce new instances, ensuring deterministic interpolation.

## References

- [Road](./road.md)
- [Package](./package.md)
- [Agent](./agent.md)
