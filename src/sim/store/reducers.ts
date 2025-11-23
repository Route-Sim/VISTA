import type { SimEvent } from '../events';
import type { SimDraft } from './snapshot';
import { ReducerRegistry } from './reducer-registry';

function shallowMerge<T extends object>(a: T, b: Partial<T>): T {
  return { ...(a as any), ...(b as any) } as T;
}

const mapCreated = (
  draft: SimDraft,
  evt: Extract<SimEvent, { type: 'map.created' }>,
) => {
  draft.nodes = evt.nodes;
  draft.edges = evt.edges;
  draft.roads = evt.roads;
  draft.buildings = evt.buildings;
};

const agentCreated = (
  draft: SimDraft,
  evt: Extract<SimEvent, { type: 'agent.created' }>,
) => {
  draft.agents[evt.agent.id] = evt.agent;
};

const agentUpdated = (
  draft: SimDraft,
  evt: Extract<SimEvent, { type: 'agent.updated' }>,
) => {
  // Try agents
  if (draft.agents[evt.id]) {
    draft.agents[evt.id] = shallowMerge(draft.agents[evt.id], evt.patch);
  }

  // Check if we need to promote a generic agent to a truck or building
  // This happens if we received agent.created (generic) but now got more specific data
  // OR if we just missed the creation event.

  // Try trucks
  const truckId = evt.id as any;
  if (draft.trucks[truckId]) {
    draft.trucks[truckId] = shallowMerge(draft.trucks[truckId], evt.patch);
  } else if (evt.patch.kind === 'truck') {
    // Create truck on the fly if it doesn't exist but patch says it is a truck
    // This is a fallback for missing creation events or out-of-order delivery
    draft.trucks[truckId] = {
      id: truckId,
      capacity: 0,
      maxSpeed: (evt.patch.maxSpeed as number) || 100,
      currentSpeed: (evt.patch.currentSpeed as number) || 0,
      packageIds: [],
      maxFuel: 100,
      currentFuel: 100,
      co2Emission: 0,
      currentNodeId: (evt.patch.currentNodeId as any) || null,
      currentEdgeId: (evt.patch.currentEdgeId as any) || null,
      currentBuildingId: (evt.patch.currentBuildingId as any) || null,
      edgeProgress: (evt.patch.edgeProgress as number) || 0,
      inboxCount: (evt.patch.inboxCount as number) || 0,
      outboxCount: (evt.patch.outboxCount as number) || 0,
      route: (evt.patch.route as any) || [],
      destinationNodeId: (evt.patch.destinationNodeId as any) || null,
      routeStartNodeId: (evt.patch.routeStartNodeId as any) || null,
      routeEndNodeId: (evt.patch.routeEndNodeId as any) || null,
      ...evt.patch,
    } as any;
  }

  // Try buildings
  const buildingId = evt.id as any;
  if (draft.buildings[buildingId]) {
    draft.buildings[buildingId] = shallowMerge(
      draft.buildings[buildingId],
      evt.patch as any,
    );
  }
};

const agentDeleted = (
  draft: SimDraft,
  evt: Extract<SimEvent, { type: 'agent.deleted' }>,
) => {
  delete draft.agents[evt.id];
  delete draft.trucks[evt.id as any];
  delete draft.buildings[evt.id as any];
};

const simulationConfig = (
  draft: SimDraft,
  evt: Extract<SimEvent, { type: 'simulation.config' }>,
) => {
  draft.config = evt.config;
};

export function createDefaultReducerRegistry(): ReducerRegistry {
  const registry = new ReducerRegistry();
  registry.register('map.created', mapCreated as any);

  registry.register('agent.created', agentCreated as any);
  registry.register('agent.updated', agentUpdated as any);
  registry.register('agent.deleted', agentDeleted as any);
  registry.register('simulation.config', simulationConfig as any);

  return registry;
}
