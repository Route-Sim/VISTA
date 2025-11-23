import type { SimDraft } from '../store/snapshot';
import type { Truck } from '../domain/entities';

export class MovementSystem {
  update(draft: SimDraft, deltaTimeMs: number): void {
    if (deltaTimeMs <= 0) return;

    const simSpeed = draft.config?.speed ?? 1.0;

    // We process all trucks
    for (const truck of Object.values(draft.trucks)) {
      this.predictTruckMovement(truck, draft, deltaTimeMs, simSpeed);
    }
  }

  private predictTruckMovement(
    truck: Truck,
    draft: SimDraft,
    deltaTimeMs: number,
    simSpeed: number,
  ): void {
    // Only predict movement if the truck is currently on an edge
    if (!truck.currentEdgeId) return;
    if (truck.currentSpeed <= 0) return;

    const road = draft.roads[truck.currentEdgeId];
    if (!road) return;

    // Calculate distance to move in meters
    // Speed is in km/h.
    // m/s = km/h / 3.6
    // m/ms = (km/h / 3.6) / 1000
    // distance = speed_mps * (deltaTimeMs / 1000) * simSpeed  <-- Wait, logic check

    // Correct formula:
    // speed_m_per_s = truck.currentSpeed / 3.6
    // time_s = (deltaTimeMs / 1000) * simSpeed
    // distance_m = speed_m_per_s * time_s

    const speedMps = truck.currentSpeed / 3.6;
    const timeSeconds = (deltaTimeMs / 1000) * simSpeed;
    const distanceM = speedMps * timeSeconds;

    truck.edgeProgress += distanceM;

    // Clamp to road length.
    // We do NOT transition to next node/edge here; we wait for server update.
    if (truck.edgeProgress > road.lengthM) {
      truck.edgeProgress = road.lengthM;
    }
  }
}
