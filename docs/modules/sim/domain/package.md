---
title: 'Package'
summary: 'Models a transport job with origin, destination, size, and current building association.'
source_paths:
  - 'src/sim/domain/package.ts'
last_updated: '2025-10-31'
owner: 'Mateusz Nędzi'
tags: ['module', 'sim', 'domain', 'logistics']
links:
  parent: '../../SUMMARY.md'
  siblings:
    ['./site.md', './depot.md', './truck.md']
---

# Package

> **Purpose:** Encode the essential data for a parcel moving through the network so planners can match trucks to demands.

## Context & Motivation

- Packages travel between sites via depots and trucks. Tracking current building IDs lets systems know where pickup/drop-off must occur next.

## Responsibilities & Boundaries

- In-scope: immutable fields, ability to relocate the package to another building.
- Out-of-scope: scheduling, prioritisation, or ownership—handled in higher-level systems.

## Public API / Usage

```14:29:src/sim/domain/package.ts
const pkg = new Package({
  id: 'PKG-1',
  size: 1,
  startSiteId: 'S1',
  endSiteId: 'S2',
});
const enRoute = pkg.relocate('TRUCK-DOCK');
```

## References

- [Site](./site.md)
- [Truck](./truck.md)

