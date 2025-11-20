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
  // Try trucks
  const truckId = evt.id as any;
  if (draft.trucks[truckId]) {
    draft.trucks[truckId] = shallowMerge(draft.trucks[truckId], evt.patch);
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

export function createDefaultReducerRegistry(): ReducerRegistry {
  const registry = new ReducerRegistry();
  registry.register('map.created', mapCreated as any);

  registry.register('agent.created', agentCreated as any);
  registry.register('agent.updated', agentUpdated as any);
  registry.register('agent.deleted', agentDeleted as any);

  return registry;
}
