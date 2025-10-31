import { Edge } from '@/sim/domain/edge';
import { type Speed, type TruckId } from '@/sim/domain/types';

interface RoadParams {
  id: string;
  startNodeId: string;
  endNodeId: string;
  maxSpeed: Speed;
  truckIds?: Iterable<TruckId>;
}

export class Road extends Edge {
  private readonly _maxSpeed: Speed;
  private readonly truckIds: Set<TruckId>;

  constructor(params: RoadParams) {
    super({
      id: params.id,
      startNodeId: params.startNodeId,
      endNodeId: params.endNodeId,
    });
    this._maxSpeed = params.maxSpeed;
    this.truckIds = new Set(params.truckIds ?? []);
  }

  public get maxSpeed(): Speed {
    return this._maxSpeed;
  }

  public listTruckIds(): TruckId[] {
    return Array.from(this.truckIds);
  }

  public hasTruck(truckId: TruckId): boolean {
    return this.truckIds.has(truckId);
  }

  public addTruck(truckId: TruckId): Road {
    if (this.truckIds.has(truckId)) {
      return this;
    }

    const next = new Road({
      id: this.id,
      startNodeId: this.startNodeId,
      endNodeId: this.endNodeId,
      maxSpeed: this.maxSpeed,
      truckIds: this.truckIds,
    });
    next.truckIds.add(truckId);
    return next;
  }

  public removeTruck(truckId: TruckId): Road {
    if (!this.truckIds.has(truckId)) {
      return this;
    }

    const next = new Road({
      id: this.id,
      startNodeId: this.startNodeId,
      endNodeId: this.endNodeId,
      maxSpeed: this.maxSpeed,
      truckIds: this.truckIds,
    });
    next.truckIds.delete(truckId);
    return next;
  }
}
