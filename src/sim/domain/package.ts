import {
  type BuildingId,
  type Identifiable,
  type PackageId,
  type SiteId,
} from '@/sim/domain/types';

interface PackageParams {
  id: PackageId;
  size: number;
  startSiteId: SiteId;
  endSiteId: SiteId;
  currentBuildingId?: BuildingId;
}

export class Package implements Identifiable {
  private readonly _id: PackageId;
  private readonly _size: number;
  private readonly _startSiteId: SiteId;
  private readonly _endSiteId: SiteId;
  private readonly _currentBuildingId?: BuildingId;

  constructor(params: PackageParams) {
    this._id = params.id;
    this._size = params.size;
    this._startSiteId = params.startSiteId;
    this._endSiteId = params.endSiteId;
    this._currentBuildingId = params.currentBuildingId;
  }

  public get id(): PackageId {
    return this._id;
  }

  public get size(): number {
    return this._size;
  }

  public get startSiteId(): SiteId {
    return this._startSiteId;
  }

  public get endSiteId(): SiteId {
    return this._endSiteId;
  }

  public get currentBuildingId(): BuildingId | undefined {
    return this._currentBuildingId;
  }

  public relocate(toBuildingId: BuildingId | undefined): Package {
    return new Package({
      id: this.id,
      size: this.size,
      startSiteId: this.startSiteId,
      endSiteId: this.endSiteId,
      currentBuildingId: toBuildingId,
    });
  }
}
