import { Building } from '@/sim/domain/building';
import { type PackageId } from '@/sim/domain/types';

interface SiteParams {
  id: string;
  nodeId: string;
  truckIds?: Iterable<string>;
  packageIds?: Iterable<PackageId>;
}

export class Site extends Building {
  private readonly packageIds: Set<PackageId>;

  constructor(params: SiteParams) {
    super({ id: params.id, nodeId: params.nodeId, truckIds: params.truckIds });
    this.packageIds = new Set(params.packageIds ?? []);
  }

  public listPackageIds(): PackageId[] {
    return Array.from(this.packageIds);
  }

  public hasPackage(packageId: PackageId): boolean {
    return this.packageIds.has(packageId);
  }

  public addPackage(packageId: PackageId): Site {
    if (this.packageIds.has(packageId)) {
      return this;
    }

    const next = new Site({
      id: this.id,
      nodeId: this.nodeId,
      truckIds: this.listTruckIds(),
      packageIds: this.packageIds,
    });
    next.packageIds.add(packageId);
    return next;
  }

  public removePackage(packageId: PackageId): Site {
    if (!this.packageIds.has(packageId)) {
      return this;
    }

    const next = new Site({
      id: this.id,
      nodeId: this.nodeId,
      truckIds: this.listTruckIds(),
      packageIds: this.packageIds,
    });
    next.packageIds.delete(packageId);
    return next;
  }
}
