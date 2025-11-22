import { describe, it, expect } from 'vitest';
import { interpolateSnapshots } from '@/sim/systems/interpolation';
import { createEmptySnapshot } from '@/sim/store/snapshot';

describe('Interpolation System', () => {
  it('should return frame with clamped alpha', () => {
    const s1 = { ...createEmptySnapshot(), tick: 1 };
    const s2 = { ...createEmptySnapshot(), tick: 2 };

    const f1 = interpolateSnapshots(s1, s2, 0.5);
    expect(f1.alpha).toBe(0.5);
    expect(f1.snapshotA).toBe(s1);
    expect(f1.snapshotB).toBe(s2);

    const f2 = interpolateSnapshots(s1, s2, 1.5);
    expect(f2.alpha).toBe(1);

    const f3 = interpolateSnapshots(s1, s2, -0.5);
    expect(f3.alpha).toBe(0);
  });
});

