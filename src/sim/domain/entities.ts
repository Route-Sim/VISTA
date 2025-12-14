import type {
  AgentId,
  BrokerId,
  BuildingId,
  EdgeId,
  NodeId,
  PackageId,
  RoadId,
  SiteId,
  TruckId,
} from './ids';
import type {
  BuildingKind,
  DeliveryUrgency,
  Priority,
  RoadClass,
} from './enums';

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
  mode: number;
  lanes: number;
  maxSpeedKph: number;
  weightLimitKg: number | null;
  truckIds: TruckId[];
}

// Buildings hierarchy
export interface BuildingBase {
  id: BuildingId;
  nodeId: NodeId;
  kind: BuildingKind; // "parking" | "site" | "gas_station"
  truckIds: TruckId[];
}

export interface Parking extends BuildingBase {
  kind: 'parking';
  capacity: number;
}

// Package generation configuration for sites
export interface PackageConfig {
  sizeRange: [number, number];
  valueRangeCurrency: [number, number];
  pickupDeadlineRangeTicks: [number, number];
  deliveryDeadlineRangeTicks: [number, number];
  priorityWeights: Record<string, number>;
  urgencyWeights: Record<string, number>;
}

// Site statistics
export interface SiteStatistics {
  packagesGenerated: number;
  packagesPickedUp: number;
  packagesDelivered: number;
  packagesExpired: number;
  totalValueDelivered: number;
  totalValueExpired: number;
}

export interface Site extends BuildingBase {
  kind: 'site';
  name?: string;
  capacity?: number;
  activityRate?: number;
  loadingRateTonnesPerMin?: number;
  destinationWeights?: Record<string, number>;
  packageConfig?: PackageConfig;
  packageIds: PackageId[];
  statistics?: SiteStatistics;
}

export interface GasStation extends BuildingBase {
  kind: 'gas_station';
  capacity: number;
  costFactor: number;
}

// Logistics
export interface Package {
  id: PackageId;
  originBuildingId: SiteId;
  destinationBuildingId: SiteId;
  size: number;
  valueCurrency: number;
  priority: Priority;
  urgency: DeliveryUrgency;
  pickupDeadlineTick: number;
  deliveryDeadlineTick: number;
  createdAtTick: number;
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
  inboxCount: number;
  outboxCount: number;

  // Position state
  currentNodeId: NodeId | null;
  currentEdgeId: RoadId | null;
  currentBuildingId: BuildingId | null;
  edgeProgress: number;

  // Navigation state
  route: NodeId[];
  destinationNodeId: NodeId | null;
  routeStartNodeId: NodeId | null;
  routeEndNodeId: NodeId | null;

  // Driving state
  drivingTimeS: number;
  restingTimeS: number;
  isResting: boolean;

  // Economic state
  balanceDucats: number;
  riskFactor: number;

  // Behavioral flags
  isSeekingParking: boolean;
  originalDestination: NodeId | null;
  isSeekingGasStation: boolean;
  isFueling: boolean;
}

export interface Broker {
  id: BrokerId;
  balanceDucats: number;
  queueSize: number;
  assignedCount: number;
  hasActiveNegotiation: boolean;
}

export interface Agent {
  id: AgentId;
}

// Utility collection types for normalized storage
export type NodeMap = Record<NodeId, Node>;
export type EdgeMap = Record<EdgeId, Edge>;
export type RoadMap = Record<RoadId, Road>;
export type BuildingMap = Record<BuildingId, Parking | Site | GasStation>;
export type TruckMap = Record<TruckId, Truck>;
export type BrokerMap = Record<BrokerId, Broker>;
export type PackageMap = Record<PackageId, Package>;
export type AgentMap = Record<AgentId, Agent>;
