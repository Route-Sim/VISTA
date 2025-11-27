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

    // Accumulate progress along the current edge (in meters)
    truck.edgeProgress += distanceM;

    // If we haven't reached the end of the current road, we're done.
    if (truck.edgeProgress < road.lengthM) {
      truck.currentNodeId = null;
      return;
    }

    // We have reached or passed the end of the current edge.
    // Determine if we can transition to a next edge based on the route, which
    // in some scenarios is treated as a sequence of road/edge IDs.
    const route = (truck.route ?? []) as unknown as string[];
    const routeEdges = route.filter((id) => draft.roads[id as keyof typeof draft.roads]) as any[];

    let remainingProgress = truck.edgeProgress;
    let currentEdgeId = truck.currentEdgeId;

    // Walk along the route while we have more distance than the current edge length.
    while (currentEdgeId && remainingProgress >= (draft.roads[currentEdgeId]?.lengthM ?? 0)) {
      const currentRoad = draft.roads[currentEdgeId];
      if (!currentRoad) break;

      const overshoot = remainingProgress - currentRoad.lengthM;

      // Find the next edge in the interpreted route sequence.
      const idx = routeEdges.indexOf(currentEdgeId as unknown as string);
      const nextEdgeId =
        idx >= 0 && idx + 1 < routeEdges.length
          ? (routeEdges[idx + 1] as keyof typeof draft.roads)
          : null;

      if (!nextEdgeId) {
        // No next edge: clamp to the end of the current road, snap to end node (if any),
        // and stop the truck.
        truck.currentEdgeId = currentEdgeId;
        truck.edgeProgress = currentRoad.lengthM;
        if (currentRoad.endNodeId) {
          truck.currentNodeId = currentRoad.endNodeId;
        }
        truck.currentSpeed = 0;
        return;
      }

      // Move onto the next edge and continue with the overshoot distance.
      currentEdgeId = nextEdgeId as any;
      remainingProgress = overshoot;
    }

    // If we have transitioned to a new edge, update the truck state accordingly.
    if (currentEdgeId && currentEdgeId !== truck.currentEdgeId) {
      truck.currentEdgeId = currentEdgeId;
      truck.edgeProgress = remainingProgress;
      // While on an edge, we are between nodes.
      truck.currentNodeId = null;
      return;
    }

    // Fallback: clamp to the end of the original road if we did not manage to
    // move to another edge for any reason.
    truck.edgeProgress = road.lengthM;
    if (road.endNodeId) {
      truck.currentNodeId = road.endNodeId;
    }
    truck.currentSpeed = 0;
  }
}
