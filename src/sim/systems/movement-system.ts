import type { SimDraft } from '../store/snapshot';
import type { Truck } from '../domain/entities';

export class MovementSystem {
  update(draft: SimDraft, deltaTimeMs: number): void {
    if (deltaTimeMs <= 0) return;

    // Convert ms to hours for speed (km/h) calculation
    const deltaTimeHours = deltaTimeMs / (1000 * 60 * 60);

    for (const truck of Object.values(draft.trucks)) {
      this.updateTruck(truck, draft, deltaTimeHours);
    }
  }

  private updateTruck(
    truck: Truck,
    draft: SimDraft,
    deltaTimeHours: number,
  ): void {
    if (truck.currentSpeed <= 0) return;
    if (!truck.currentEdgeId) return; // Can't move if not on edge

    const road = draft.roads[truck.currentEdgeId];
    if (!road) return;

    // Distance to move in km
    const distKm = truck.currentSpeed * deltaTimeHours;
    // Distance to move in meters
    const distM = distKm * 1000;

    truck.edgeProgress += distM;

    // Check if reached end of edge
    if (truck.edgeProgress >= road.lengthM) {
      const excessM = truck.edgeProgress - road.lengthM;

      // Try to advance to next edge in route
      const nextEdgeId = this.getNextEdge(truck);

      if (nextEdgeId && draft.roads[nextEdgeId]) {
        // Move to next edge
        truck.currentEdgeId = nextEdgeId;
        truck.currentNodeId = null; // Moving on edge
        truck.edgeProgress = excessM; // Carry over excess distance
      } else {
        // End of route or blocked
        truck.edgeProgress = road.lengthM; // Clamp to end
        truck.currentNodeId = road.endNodeId; // Arrived at node
        // truck.currentSpeed = 0; // Optional: stop? Or keep speed for when new route comes?
        // Keeping speed > 0 allows immediate resume if route is extended,
        // but physically it should stop.
        // For now, let's clamp position but not force speed to 0 to avoid fighting server updates too hard.
      }
    }
  }

  private getNextEdge(truck: Truck): string | null {
    if (!truck.route || truck.route.length === 0) return null;

    // Find current edge index
    const idx = truck.route.indexOf(truck.currentEdgeId!);
    if (idx === -1) {
      // If current edge not in route, maybe we just started?
      // Or route changed?
      // Simple heuristic: if route has edges, take first?
      // But safer: if not found, assume we can't auto-advance.
      return null;
    }

    if (idx + 1 < truck.route.length) {
      return truck.route[idx + 1];
    }

    return null;
  }
}
