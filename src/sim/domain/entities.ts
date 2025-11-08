import type {
  AgentId,
  BuildingId,
  EdgeId,
  NodeId,
  PackageId,
  RoadId,
  SiteId,
  TruckId,
} from './ids';
import type { BuildingKind } from './enums';
import type { RoadClass } from './enums';

// Core graph primitives
export interface Node {
  id: NodeId;
  // Position in meters (simulation plane coordinates)
  x: number;
  y: number;
  // Buildings (including Sites) attached to this node
  buildingIds: BuildingId[];
}

export interface Edge {
  id: EdgeId;
  startNodeId: NodeId;
  endNodeId: NodeId;
  // Length in meters
  lengthM: number;
}

// Roads are edges with traffic attributes; share identity with Edge (RoadId = EdgeId)
export interface Road extends Edge {
  id: RoadId;
  // Transport/traffic attributes
  roadClass: RoadClass;
  lanes: number;
  maxSpeedKph: number;
  weightLimitKg: number | null;
  truckIds: TruckId[];
}

// Buildings hierarchy
export interface BuildingBase {
  id: BuildingId;
  nodeId: NodeId;
  kind: BuildingKind; // "building" | "depot" | "gas-station" | "site"
  truckIds: TruckId[];
}

export interface Building extends BuildingBase {
  kind: 'building';
}

export interface Depot extends BuildingBase {
  kind: 'depot';
  capacity: number;
  packageIds: PackageId[];
}

export interface GasStation extends BuildingBase {
  kind: 'gas-station';
  capacity: number;
}

export interface Site extends BuildingBase {
  kind: 'site';
  packageIds: PackageId[];
}

// Logistics
export interface Package {
  id: PackageId;
  size: number;
  startSiteId: SiteId; // Site is a Building
  endSiteId: SiteId;
}

export interface Truck {
  id: TruckId;
  capacity: number;
  maxSpeed: number;
  currentSpeed: number;
  packageIds: PackageId[];
  maxFuel: number;
  currentFuel: number;
  co2Emission: number;
}

export interface Agent {
  id: AgentId;
}

// Utility collection types for normalized storage
export type NodeMap = Record<NodeId, Node>;
export type EdgeMap = Record<EdgeId, Edge>;
export type RoadMap = Record<RoadId, Road>;
export type BuildingMap = Record<
  BuildingId,
  Building | Depot | GasStation | Site
>;
export type TruckMap = Record<TruckId, Truck>;
export type PackageMap = Record<PackageId, Package>;
export type AgentMap = Record<AgentId, Agent>;
