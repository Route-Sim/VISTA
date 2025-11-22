import { describe, it, expect } from 'vitest';
import type { RoadClass, BuildingKind, EntityKind } from '@/sim/domain/enums';

// Type-only test to verify exported enums
describe('Domain Enums', () => {
  it('should allow valid road classes', () => {
    const rc: RoadClass = 'A';
    expect(rc).toBe('A');
  });

  it('should allow valid building kinds', () => {
    const bk: BuildingKind = 'parking';
    expect(bk).toBe('parking');
  });

  it('should allow valid entity kinds', () => {
    const ek: EntityKind = 'truck';
    expect(ek).toBe('truck');
  });
});

