import { describe, it, expect } from 'vitest';
import {
  asNodeId,
  asEdgeId,
  asRoadId,
  asBuildingId,
  asSiteId,
  asTruckId,
  asPackageId,
  asAgentId,
} from '@/sim/domain/ids';

describe('Domain IDs', () => {
  it('should identity cast strings to branded IDs', () => {
    // This is mostly a compile-time check, but runtime behavior should be identity
    const raw = '123';
    expect(asNodeId(raw)).toBe(raw);
    expect(asEdgeId(raw)).toBe(raw);
    expect(asRoadId(raw)).toBe(raw);
    expect(asBuildingId(raw)).toBe(raw);
    expect(asSiteId(raw)).toBe(raw);
    expect(asTruckId(raw)).toBe(raw);
    expect(asPackageId(raw)).toBe(raw);
    expect(asAgentId(raw)).toBe(raw);
  });
});

