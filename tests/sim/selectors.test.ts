import { describe, it, expect } from 'vitest';
import {
  getNodeById,
  getRoadById,
  getTruckById,
  getBuildingById,
  getSiteById,
  getBuildingsAtNode,
  getSitesAtNode,
  getPackagesAtSite,
  getOutgoingEdges,
  getIncomingEdges,
} from '@/sim/selectors';
import { createEmptySnapshot } from '@/sim/store/snapshot';
import { asNodeId, asRoadId, asTruckId, asBuildingId, asPackageId, asEdgeId } from '@/sim/domain/ids';

describe('Sim Selectors', () => {
  const snapshot = createEmptySnapshot();
  const n1 = asNodeId('n1');
  const n2 = asNodeId('n2');
  const r1 = asRoadId('r1');
  const t1 = asTruckId('t1');
  const b1 = asBuildingId('b1'); // Parking
  const b2 = asBuildingId('b2'); // Site
  const p1 = asPackageId('p1');

  // Setup data
  snapshot.nodes[n1] = { id: n1, x: 0, y: 0, buildingIds: [b1, b2] };
  snapshot.nodes[n2] = { id: n2, x: 100, y: 100, buildingIds: [] };
  
  snapshot.roads[r1] = { id: r1, startNodeId: n1, endNodeId: n2 } as any;
  snapshot.edges[r1] = { id: r1, startNodeId: n1, endNodeId: n2 } as any; // Roads are edges
  
  snapshot.trucks[t1] = { id: t1 } as any;
  
  snapshot.buildings[b1] = { id: b1, kind: 'parking', nodeId: n1 } as any;
  snapshot.buildings[b2] = { id: b2, kind: 'site', nodeId: n1, packageIds: [p1] } as any;

  it('should get entities by id', () => {
    expect(getNodeById(snapshot, n1)).toBeDefined();
    expect(getRoadById(snapshot, r1)).toBeDefined();
    expect(getTruckById(snapshot, t1)).toBeDefined();
    expect(getBuildingById(snapshot, b1)).toBeDefined();
  });

  it('should get site by id', () => {
    expect(getSiteById(snapshot, b2)).toBeDefined();
    expect(getSiteById(snapshot, b1)).toBeUndefined(); // b1 is parking
  });

  it('should get buildings at node', () => {
    const buildings = getBuildingsAtNode(snapshot, n1);
    expect(buildings).toHaveLength(2);
    expect(buildings.map(b => b.id)).toContain(b1);
    expect(buildings.map(b => b.id)).toContain(b2);
  });

  it('should get sites at node', () => {
    const sites = getSitesAtNode(snapshot, n1);
    expect(sites).toHaveLength(1);
    expect(sites[0].id).toBe(b2);
  });

  it('should get packages at site', () => {
    const pkgs = getPackagesAtSite(snapshot, b2);
    expect(pkgs).toHaveLength(1);
    expect(pkgs[0]).toBe(p1);
  });

  it('should get outgoing edges', () => {
    const out = getOutgoingEdges(snapshot, n1);
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe(r1);
  });

  it('should get incoming edges', () => {
    const inc = getIncomingEdges(snapshot, n2);
    expect(inc).toHaveLength(1);
    expect(inc[0].id).toBe(r1);
  });
});

