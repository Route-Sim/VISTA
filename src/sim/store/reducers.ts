import type { SimEvent } from '../events';
import type { SimDraft } from './snapshot';
import { ReducerRegistry } from './reducer-registry';

function shallowMerge<T extends object>(a: T, b: Partial<T>): T {
  return { ...(a as any), ...(b as any) } as T;
}

const agentUpdated = (
  draft: SimDraft,
  evt: Extract<SimEvent, { type: 'agent.updated' }>,
) => {
  const curr = draft.agents[evt.id];
  if (!curr) return;
  draft.agents[evt.id] = shallowMerge(curr, evt.patch);
};

const buildingUpdated = (
  draft: SimDraft,
  evt: Extract<SimEvent, { type: 'building.updated' }>,
) => {
  const curr = draft.buildings[evt.id];
  if (!curr) return;
  draft.buildings[evt.id] = shallowMerge(curr as any, evt.patch as any);
};

const siteUpdated = (
  draft: SimDraft,
  evt: Extract<SimEvent, { type: 'site.updated' }>,
) => {
  const curr = draft.buildings[evt.id];
  if (!curr || curr.kind !== 'site') return;
  draft.buildings[evt.id] = shallowMerge(curr as any, evt.patch as any);
};

export function createDefaultReducerRegistry(): ReducerRegistry {
  const registry = new ReducerRegistry();
  registry.register('agent.updated', agentUpdated as any);
  registry.register('building.updated', buildingUpdated as any);
  registry.register('site.updated', siteUpdated as any);
  return registry;
}
