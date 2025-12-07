// Discriminant enums used across domain entities.

export type BuildingKind = 'parking' | 'site' | 'gas_station';

// Road classification aligned with wire protocol but independent from it
export type RoadClass = 'A' | 'S' | 'GP' | 'G' | 'Z' | 'L' | 'D';

export type EntityKind =
  | 'node'
  | 'edge'
  | 'road'
  | 'parking'
  | 'site'
  | 'gas_station'
  | 'truck'
  | 'package'
  | 'agent';
