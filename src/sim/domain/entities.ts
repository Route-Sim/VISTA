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
  kind: BuildingKind; // "parking" | "site"
  truckIds: TruckId[];
}

export interface Parking extends BuildingBase {
  kind: 'parking';
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

  // Position state
  currentNodeId: NodeId | null;
  currentEdgeId: RoadId | null;
  edgeProgress: number;

  // Navigation state
  route: NodeId[];
}

export interface Agent {
  id: AgentId;
}

// Utility collection types for normalized storage
export type NodeMap = Record<NodeId, Node>;
export type EdgeMap = Record<EdgeId, Edge>;
export type RoadMap = Record<RoadId, Road>;
export type BuildingMap = Record<BuildingId, Parking | Site>;
export type TruckMap = Record<TruckId, Truck>;
export type PackageMap = Record<PackageId, Package>;
export type AgentMap = Record<AgentId, Agent>;
