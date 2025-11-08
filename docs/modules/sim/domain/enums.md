---
title: "SIM Domain Enums"
summary: "Discriminant and classification enums used across the simulation domain, including building kinds and road classes aligned with the wire protocol."
source_paths:
  - "src/sim/domain/enums.ts"
last_updated: "2025-11-08"
owner: "Mateusz Nędzi"
tags: ["module", "sim", "domain", "types"]
links:
  parent: "../../../SUMMARY.md"
  siblings: []
---

# SIM Domain Enums

> Purpose: Provide stable discriminants and classifications for entities. These types are independent from three.js and networking; adapters translate wire values into these enums.

## Enumerations

- BuildingKind: `"building" | "depot" | "gas-station" | "site"`
- RoadClass: `"A" | "S" | "GP" | "G" | "Z" | "L" | "D"`
- EntityKind: `"node" | "edge" | "road" | "building" | "depot" | "gas-station" | "site" | "truck" | "package" | "agent"`

## Notes

- `RoadClass` mirrors the server’s road classification while remaining decoupled from the wire schema types.
- These enums are used as discriminants in entity unions and to guide reducers/selectors.

## References

- `src/sim/domain/entities.ts`
- `src/sim/store/reducers.ts`


