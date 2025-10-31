import {
  type AgentId,
  type Identifiable,
  type TruckId,
} from '@/sim/domain/types';

interface AgentParams {
  id: AgentId;
  assignedTruckId?: TruckId;
}

export class Agent implements Identifiable {
  private readonly _id: AgentId;
  private readonly _assignedTruckId?: TruckId;

  constructor(params: AgentParams) {
    this._id = params.id;
    this._assignedTruckId = params.assignedTruckId;
  }

  public get id(): AgentId {
    return this._id;
  }

  public get assignedTruckId(): TruckId | undefined {
    return this._assignedTruckId;
  }

  public assignTruck(truckId: TruckId | undefined): Agent {
    return new Agent({ id: this.id, assignedTruckId: truckId });
  }
}
