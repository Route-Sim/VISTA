// Discriminant enums used across domain entities.

export type BuildingKind = 'building' | 'depot' | 'gas-station' | 'site';

// Road classification aligned with wire protocol but independent from it
export type RoadClass = 'A' | 'S' | 'GP' | 'G' | 'Z' | 'L' | 'D';

export type EntityKind =
  | 'node'
  | 'edge'
  | 'road'
  | 'building'
  | 'depot'
  | 'gas-station'
  | 'site'
  | 'truck'
  | 'package'
  | 'agent';
