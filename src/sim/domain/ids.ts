// Branded ID types for domain entities. These are plain strings at runtime
// but provide compile-time safety and clarity across the simulation layer.

export type Brand<T, B extends string> = T & { readonly __brand: B };

export type Uuid = string;

export type NodeId = Brand<string, 'NodeId'>;
export type EdgeId = Brand<string, 'EdgeId'>;
export type RoadId = EdgeId; // Roads inherit from edges; share identity
export type BuildingId = Brand<string, 'BuildingId'>;
export type SiteId = BuildingId; // Sites are buildings
export type TruckId = Brand<string, 'TruckId'>;
export type PackageId = Brand<string, 'PackageId'>;
export type AgentId = Brand<string, 'AgentId'>;

// Factory helpers (optional at call sites). These are identity functions that
// cast to the branded type while keeping runtime as plain string.
export const asNodeId = (id: string): NodeId => id as NodeId;
export const asEdgeId = (id: string): EdgeId => id as EdgeId;
export const asRoadId = (id: string): RoadId => id as RoadId;
export const asBuildingId = (id: string): BuildingId => id as BuildingId;
export const asSiteId = (id: string): SiteId => id as SiteId;
export const asTruckId = (id: string): TruckId => id as TruckId;
export const asPackageId = (id: string): PackageId => id as PackageId;
export const asAgentId = (id: string): AgentId => id as AgentId;
