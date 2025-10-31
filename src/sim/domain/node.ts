import {
  type BuildingId,
  type Identifiable,
  type NodeId,
} from '@/sim/domain/types';

export class Node implements Identifiable {
  private readonly _id: NodeId;
  private readonly buildingIds: Set<BuildingId>;

  constructor(params: { id: NodeId; buildingIds?: Iterable<BuildingId> }) {
    this._id = params.id;
    this.buildingIds = new Set(params.buildingIds ?? []);
  }

  public get id(): NodeId {
    return this._id;
  }

  public listBuildingIds(): BuildingId[] {
    return Array.from(this.buildingIds);
  }

  public hasBuilding(buildingId: BuildingId): boolean {
    return this.buildingIds.has(buildingId);
  }

  public addBuilding(buildingId: BuildingId): Node {
    if (this.buildingIds.has(buildingId)) {
      return this;
    }

    const next = new Node({ id: this.id, buildingIds: this.buildingIds });
    next.buildingIds.add(buildingId);
    return next;
  }

  public removeBuilding(buildingId: BuildingId): Node {
    if (!this.buildingIds.has(buildingId)) {
      return this;
    }

    const next = new Node({ id: this.id, buildingIds: this.buildingIds });
    next.buildingIds.delete(buildingId);
    return next;
  }
}
