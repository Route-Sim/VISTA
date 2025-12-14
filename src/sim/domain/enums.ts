// Discriminant enums used across domain entities.

export type BuildingKind = 'parking' | 'site' | 'gas_station';

// Road classification aligned with wire protocol but independent from it
export type RoadClass = 'A' | 'S' | 'GP' | 'G' | 'Z' | 'L' | 'D';

// Package priority levels
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// Delivery urgency levels
export type DeliveryUrgency = 'STANDARD' | 'EXPRESS' | 'SAME_DAY';

// Agent kinds for discriminated unions
export type AgentKind = 'truck' | 'building' | 'broker';

export type EntityKind =
  | 'node'
  | 'edge'
  | 'road'
  | 'parking'
  | 'site'
  | 'gas_station'
  | 'truck'
  | 'package'
  | 'broker'
  | 'agent';
