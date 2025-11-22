import { describe, it, expect } from 'vitest';
import { MovementSystem } from '@/sim/systems/movement-system';
import { createEmptySnapshot } from '@/sim/store/snapshot';
import { asRoadId, asTruckId, asNodeId, asEdgeId } from '@/sim/domain/ids';

describe('MovementSystem', () => {
  it('should not update if deltaTime <= 0', () => {
    const system = new MovementSystem();
    const draft = createEmptySnapshot();
    const truckId = asTruckId('t1');
    
    draft.trucks[truckId] = {
      id: truckId,
      currentSpeed: 100,
      edgeProgress: 0,
    } as any;

    system.update(draft, 0);
    expect(draft.trucks[truckId].edgeProgress).toBe(0);
  });

  it('should move truck along edge', () => {
    const system = new MovementSystem();
    const draft = createEmptySnapshot();
    const truckId = asTruckId('t1');
    const roadId = asRoadId('r1');

    draft.roads[roadId] = {
      id: roadId,
      lengthM: 1000,
    } as any;

    draft.trucks[truckId] = {
      id: truckId,
      currentEdgeId: roadId,
      currentSpeed: 100, // km/h
      edgeProgress: 0,
    } as any;

    // Move for 1 hour = should cover 100km (100000m) - way past edge
    // Let's do 36 seconds -> 0.01 hours -> 1km
    const timeMs = 36 * 1000; 
    
    system.update(draft, timeMs);
    
    // 100 km/h = 100,000 m / 3600 s = 27.77 m/s
    // 36 s * 27.77 = 1000 m
    // Should reach end of 1000m road
    expect(draft.trucks[truckId].edgeProgress).toBeCloseTo(1000, 0);
  });

  it('should clamp to end of edge if no next route', () => {
    const system = new MovementSystem();
    const draft = createEmptySnapshot();
    const truckId = asTruckId('t1');
    const roadId = asRoadId('r1');
    const endNodeId = asNodeId('n2');

    draft.roads[roadId] = {
      id: roadId,
      lengthM: 500,
      endNodeId,
    } as any;

    draft.trucks[truckId] = {
      id: truckId,
      currentEdgeId: roadId,
      currentSpeed: 100,
      edgeProgress: 400,
      route: [roadId], // no next edge
    } as any;

    // Move enough to exceed 500m
    system.update(draft, 10000); 

    expect(draft.trucks[truckId].edgeProgress).toBe(500);
    expect(draft.trucks[truckId].currentNodeId).toBe(endNodeId);
  });

  it('should transition to next edge in route', () => {
    const system = new MovementSystem();
    const draft = createEmptySnapshot();
    const truckId = asTruckId('t1');
    const r1 = asRoadId('r1');
    const r2 = asRoadId('r2');

    draft.roads[r1] = { id: r1, lengthM: 100 } as any;
    draft.roads[r2] = { id: r2, lengthM: 100 } as any;

    draft.trucks[truckId] = {
      id: truckId,
      currentEdgeId: r1,
      currentSpeed: 100, // ~27.7 m/s
      edgeProgress: 90,
      route: [r1, r2],
    } as any;

    // Move 2 seconds (~55m)
    // 90 + 55 = 145m. 
    // Should finish r1 (100m) and be 45m into r2.
    system.update(draft, 2000);

    expect(draft.trucks[truckId].currentEdgeId).toBe(r2);
    expect(draft.trucks[truckId].currentNodeId).toBeNull();
    expect(draft.trucks[truckId].edgeProgress).toBeCloseTo(45.5, 0);
  });
});

