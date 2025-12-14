import type { SimEvent } from '../events';
import type { SimDraft } from './snapshot';
import { ReducerRegistry } from './reducer-registry';

function shallowMerge<T extends object>(a: T, b: Partial<T>): T {
  return { ...(a as object), ...(b as object) } as T;
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

const truckCreated = (
  draft: SimDraft,
  evt: Extract<SimEvent, { type: 'truck.created' }>,
) => {
  draft.trucks[evt.truck.id] = evt.truck;
};

const truckUpdated = (
  draft: SimDraft,
  evt: Extract<SimEvent, { type: 'truck.updated' }>,
) => {
  const truckId = evt.id as any;
  if (draft.trucks[truckId]) {
    const currentTruck = draft.trucks[truckId];
    const patch = evt.patch;

    // Detect edge change for trucks to reset predicted progress
    const newEdgeId = patch.currentEdgeId;
    if (
      newEdgeId !== undefined &&
      newEdgeId !== currentTruck.currentEdgeId &&
      patch.edgeProgress === undefined
    ) {
      patch.edgeProgress = 0;
    }

    draft.trucks[truckId] = shallowMerge(currentTruck, patch);
  } else {
    // Create truck on the fly if it doesn't exist
    // This is a fallback for missing creation events or out-of-order delivery
    draft.trucks[truckId] = {
      id: truckId,
      capacity: evt.patch.capacity ?? 0,
      maxSpeed: evt.patch.maxSpeed ?? 100,
      currentSpeed: evt.patch.currentSpeed ?? 0,
      packageIds: evt.patch.packageIds ?? [],
      maxFuel: evt.patch.maxFuel ?? 100,
      currentFuel: evt.patch.currentFuel ?? 100,
      co2Emission: evt.patch.co2Emission ?? 0,
      inboxCount: 0,
      outboxCount: 0,
      currentNodeId: evt.patch.currentNodeId ?? null,
      currentEdgeId: evt.patch.currentEdgeId ?? null,
      currentBuildingId: evt.patch.currentBuildingId ?? null,
      edgeProgress: evt.patch.edgeProgress ?? 0,
      route: evt.patch.route ?? [],
      destinationNodeId: evt.patch.destinationNodeId ?? null,
      routeStartNodeId: evt.patch.routeStartNodeId ?? null,
      routeEndNodeId: evt.patch.routeEndNodeId ?? null,
      drivingTimeS: evt.patch.drivingTimeS ?? 0,
      restingTimeS: evt.patch.restingTimeS ?? 0,
      isResting: evt.patch.isResting ?? false,
      balanceDucats: evt.patch.balanceDucats ?? 0,
      riskFactor: evt.patch.riskFactor ?? 0.5,
      isSeekingParking: evt.patch.isSeekingParking ?? false,
      originalDestination: evt.patch.originalDestination ?? null,
      isSeekingGasStation: evt.patch.isSeekingGasStation ?? false,
      isFueling: evt.patch.isFueling ?? false,
    };
  }
};

const brokerCreated = (
  draft: SimDraft,
  evt: Extract<SimEvent, { type: 'broker.created' }>,
) => {
  draft.brokers[evt.broker.id] = evt.broker;
};

const brokerUpdated = (
  draft: SimDraft,
  evt: Extract<SimEvent, { type: 'broker.updated' }>,
) => {
  const brokerId = evt.id;
  if (draft.brokers[brokerId]) {
    draft.brokers[brokerId] = shallowMerge(draft.brokers[brokerId], evt.patch);
  } else {
    // Create broker on the fly if it doesn't exist
    draft.brokers[brokerId] = {
      id: brokerId,
      balanceDucats: evt.patch.balanceDucats ?? 0,
      queueSize: evt.patch.queueSize ?? 0,
      assignedCount: evt.patch.assignedCount ?? 0,
      hasActiveNegotiation: evt.patch.hasActiveNegotiation ?? false,
    };
  }
};

const buildingCreated = (
  draft: SimDraft,
  evt: Extract<SimEvent, { type: 'building.created' }>,
) => {
  draft.buildings[evt.building.id] = evt.building;
};

const buildingUpdated = (
  draft: SimDraft,
  evt: Extract<SimEvent, { type: 'building.updated' }>,
) => {
  const buildingId = evt.id;
  if (draft.buildings[buildingId]) {
    draft.buildings[buildingId] = shallowMerge(
      draft.buildings[buildingId],
      evt.patch as any,
    );
  }
};

const packageCreated = (
  draft: SimDraft,
  evt: Extract<SimEvent, { type: 'package.created' }>,
) => {
  draft.packages[evt.pkg.id] = evt.pkg;
};

const agentUpdated = (
  draft: SimDraft,
  evt: Extract<SimEvent, { type: 'agent.updated' }>,
) => {
  // Try agents
  if (draft.agents[evt.id]) {
    draft.agents[evt.id] = shallowMerge(draft.agents[evt.id], evt.patch);
  }
};

const agentDeleted = (
  draft: SimDraft,
  evt: Extract<SimEvent, { type: 'agent.deleted' }>,
) => {
  delete draft.agents[evt.id];
  delete draft.trucks[evt.id as any];
  delete draft.brokers[evt.id as any];
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

  // Agent lifecycle
  registry.register('agent.created', agentCreated as any);
  registry.register('agent.updated', agentUpdated as any);
  registry.register('agent.deleted', agentDeleted as any);

  // Truck lifecycle
  registry.register('truck.created', truckCreated as any);
  registry.register('truck.updated', truckUpdated as any);

  // Broker lifecycle
  registry.register('broker.created', brokerCreated as any);
  registry.register('broker.updated', brokerUpdated as any);

  // Building lifecycle
  registry.register('building.created', buildingCreated as any);
  registry.register('building.updated', buildingUpdated as any);

  // Package lifecycle
  registry.register('package.created', packageCreated as any);

  // Simulation config
  registry.register('simulation.config', simulationConfig as any);

  return registry;
}
