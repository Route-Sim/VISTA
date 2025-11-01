// Discriminant enums used across domain entities.

export type BuildingKind = 'building' | 'depot' | 'gas-station' | 'site';

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
