export type UUID = string;

export interface Identifiable {
  readonly id: UUID;
}

export type Capacity = number;
export type Speed = number;
export type Fuel = number;

export type NodeId = UUID;
export type EdgeId = UUID;
export type RoadId = UUID;
export type BuildingId = UUID;
export type DepotId = UUID;
export type GasStationId = UUID;
export type SiteId = UUID;
export type PackageId = UUID;
export type TruckId = UUID;
export type AgentId = UUID;

export const uuid = (value: string): UUID => value;
