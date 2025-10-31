import { Building } from '@/sim/domain/building';
import { type Capacity, type TruckId } from '@/sim/domain/types';

interface GasStationParams {
  id: string;
  nodeId: string;
  capacity: Capacity;
  truckIds?: Iterable<TruckId>;
}

export class GasStation extends Building {
  private readonly _capacity: Capacity;

  constructor(params: GasStationParams) {
    super({ id: params.id, nodeId: params.nodeId, truckIds: params.truckIds });
    this._capacity = params.capacity;
  }

  public get capacity(): Capacity {
    return this._capacity;
  }
}
