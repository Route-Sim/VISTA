import {
  type Capacity,
  type Fuel,
  type Identifiable,
  type PackageId,
  type Speed,
  type TruckId,
} from '@/sim/domain/types';

interface TruckParams {
  id: TruckId;
  capacity: Capacity;
  maxSpeed: Speed;
  currentSpeed?: Speed;
  maxFuel: Fuel;
  currentFuel?: Fuel;
  packageIds?: Iterable<PackageId>;
  co2Emission?: number;
}

export class Truck implements Identifiable {
  private readonly _id: TruckId;
  private readonly _capacity: Capacity;
  private readonly _maxSpeed: Speed;
  private readonly _currentSpeed: Speed;
  private readonly _maxFuel: Fuel;
  private readonly _currentFuel: Fuel;
  private readonly packageIds: Set<PackageId>;
  private readonly _co2Emission: number;

  constructor(params: TruckParams) {
    this._id = params.id;
    this._capacity = params.capacity;
    this._maxSpeed = params.maxSpeed;
    this._currentSpeed = params.currentSpeed ?? 0;
    this._maxFuel = params.maxFuel;
    this._currentFuel = params.currentFuel ?? params.maxFuel;
    this.packageIds = new Set(params.packageIds ?? []);
    this._co2Emission = params.co2Emission ?? 0;
  }

  public get id(): TruckId {
    return this._id;
  }

  public get capacity(): Capacity {
    return this._capacity;
  }

  public get maxSpeed(): Speed {
    return this._maxSpeed;
  }

  public get currentSpeed(): Speed {
    return this._currentSpeed;
  }

  public get maxFuel(): Fuel {
    return this._maxFuel;
  }

  public get currentFuel(): Fuel {
    return this._currentFuel;
  }

  public get co2Emission(): number {
    return this._co2Emission;
  }

  public listPackageIds(): PackageId[] {
    return Array.from(this.packageIds);
  }

  public hasPackage(packageId: PackageId): boolean {
    return this.packageIds.has(packageId);
  }

  public addPackage(packageId: PackageId): Truck {
    if (this.packageIds.has(packageId)) {
      return this;
    }

    const next = this.clone();
    next.packageIds.add(packageId);
    return next;
  }

  public removePackage(packageId: PackageId): Truck {
    if (!this.packageIds.has(packageId)) {
      return this;
    }

    const next = this.clone();
    next.packageIds.delete(packageId);
    return next;
  }

  public withSpeed(speed: Speed): Truck {
    return new Truck({
      id: this.id,
      capacity: this.capacity,
      maxSpeed: this.maxSpeed,
      currentSpeed: speed,
      maxFuel: this.maxFuel,
      currentFuel: this.currentFuel,
      packageIds: this.packageIds,
      co2Emission: this.co2Emission,
    });
  }

  public withFuel(fuel: Fuel): Truck {
    return new Truck({
      id: this.id,
      capacity: this.capacity,
      maxSpeed: this.maxSpeed,
      currentSpeed: this.currentSpeed,
      maxFuel: this.maxFuel,
      currentFuel: fuel,
      packageIds: this.packageIds,
      co2Emission: this.co2Emission,
    });
  }

  public withCo2Emission(co2Emission: number): Truck {
    return new Truck({
      id: this.id,
      capacity: this.capacity,
      maxSpeed: this.maxSpeed,
      currentSpeed: this.currentSpeed,
      maxFuel: this.maxFuel,
      currentFuel: this.currentFuel,
      packageIds: this.packageIds,
      co2Emission,
    });
  }

  private clone(): Truck {
    return new Truck({
      id: this.id,
      capacity: this.capacity,
      maxSpeed: this.maxSpeed,
      currentSpeed: this.currentSpeed,
      maxFuel: this.maxFuel,
      currentFuel: this.currentFuel,
      packageIds: this.packageIds,
      co2Emission: this.co2Emission,
    });
  }
}
