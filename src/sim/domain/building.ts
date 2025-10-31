import {
  type BuildingId,
  type Identifiable,
  type NodeId,
  type TruckId,
} from '@/sim/domain/types';

interface BuildingParams {
  id: BuildingId;
  nodeId: NodeId;
  truckIds?: Iterable<TruckId>;
}

export class Building implements Identifiable {
  private readonly _id: BuildingId;
  private readonly _nodeId: NodeId;
  private readonly truckIds: Set<TruckId>;

  constructor(params: BuildingParams) {
    this._id = params.id;
    this._nodeId = params.nodeId;
    this.truckIds = new Set(params.truckIds ?? []);
  }

  public get id(): BuildingId {
    return this._id;
  }

  public get nodeId(): NodeId {
    return this._nodeId;
  }

  public listTruckIds(): TruckId[] {
    return Array.from(this.truckIds);
  }

  public hasTruck(truckId: TruckId): boolean {
    return this.truckIds.has(truckId);
  }

  public addTruck(truckId: TruckId): Building {
    if (this.truckIds.has(truckId)) {
      return this;
    }

    const next = new Building({
      id: this.id,
      nodeId: this.nodeId,
      truckIds: this.truckIds,
    });
    next.truckIds.add(truckId);
    return next;
  }

  public removeTruck(truckId: TruckId): Building {
    if (!this.truckIds.has(truckId)) {
      return this;
    }

    const next = new Building({
      id: this.id,
      nodeId: this.nodeId,
      truckIds: this.truckIds,
    });
    next.truckIds.delete(truckId);
    return next;
  }
}
