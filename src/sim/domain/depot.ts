import { Building } from '@/sim/domain/building';
import { type Capacity, type PackageId } from '@/sim/domain/types';

interface DepotParams {
  id: string;
  nodeId: string;
  capacity: Capacity;
  truckIds?: Iterable<string>;
  packageIds?: Iterable<PackageId>;
}

export class Depot extends Building {
  private readonly _capacity: Capacity;
  private readonly packageIds: Set<PackageId>;

  constructor(params: DepotParams) {
    super({ id: params.id, nodeId: params.nodeId, truckIds: params.truckIds });
    this._capacity = params.capacity;
    this.packageIds = new Set(params.packageIds ?? []);
  }

  public get capacity(): Capacity {
    return this._capacity;
  }

  public listPackageIds(): PackageId[] {
    return Array.from(this.packageIds);
  }

  public hasPackage(packageId: PackageId): boolean {
    return this.packageIds.has(packageId);
  }

  public canAccept(size: number): boolean {
    return this.packageIds.size + size <= this.capacity;
  }

  public addPackage(packageId: PackageId): Depot {
    if (this.packageIds.has(packageId)) {
      return this;
    }

    const next = new Depot({
      id: this.id,
      nodeId: this.nodeId,
      capacity: this.capacity,
      truckIds: this.listTruckIds(),
      packageIds: this.packageIds,
    });
    next.packageIds.add(packageId);
    return next;
  }

  public removePackage(packageId: PackageId): Depot {
    if (!this.packageIds.has(packageId)) {
      return this;
    }

    const next = new Depot({
      id: this.id,
      nodeId: this.nodeId,
      capacity: this.capacity,
      truckIds: this.listTruckIds(),
      packageIds: this.packageIds,
    });
    next.packageIds.delete(packageId);
    return next;
  }
}
