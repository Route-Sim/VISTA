import { describe, it, expect } from 'vitest';
import { SnapshotBuffer } from '@/sim/store/snapshot-buffer';
import { createEmptySnapshot } from '@/sim/store/snapshot';

describe('SnapshotBuffer', () => {
  it('should store and retrieve snapshots', () => {
    const buffer = new SnapshotBuffer(10);
    const s1 = createEmptySnapshot();
    s1.tick = 1;
    s1.timeMs = 100;
    
    buffer.push(s1);
    expect(buffer.getMostRecent()).toBe(s1);
  });

  it('should maintain capacity', () => {
    const buffer = new SnapshotBuffer(2);
    const s1 = { ...createEmptySnapshot(), tick: 1, timeMs: 100 };
    const s2 = { ...createEmptySnapshot(), tick: 2, timeMs: 200 };
    const s3 = { ...createEmptySnapshot(), tick: 3, timeMs: 300 };

    buffer.push(s1);
    buffer.push(s2);
    buffer.push(s3);

    // Should have dropped s1
    // Implementation: items array. shift() removes first.
    // So items should be [s2, s3]
    
    // We can verify via bracketing or internal state if exposed, 
    // or just assume s2 is now oldest available for interpolation?
    // getBracketing(50) -> undefined if s1 gone?
    // getBracketing(150) -> between s1 and s2? if s1 gone, maybe we can't interpolate there?
    // The buffer logic: items[0] is oldest.
    
    const bracket = buffer.getBracketing(150);
    // If s1 is gone, oldest is s2 (200ms). Target 150 < 200.
    // Loop starts at i=1. a=items[0] (s2). b=items[1] (s3).
    // Loop 1: target 150 <= 300? Yes. alpha between 200 and 300?
    // Wait, logic:
    // if (items.length === 1) return {a, b, alpha: 0}
    // let a = items[0];
    // for (i=1...):
    //   b = items[i]
    //   if (target <= b.timeMs) ...
    
    // Case: s1 dropped. items=[s2, s3].
    // target=150.
    // a=s2 (200).
    // b=s3 (300).
    // target <= b.timeMs (150 <= 300). match!
    // alpha between 200 and 300 for 150?
    // (150-200)/(300-200) = -0.5.
    // The interpolator handles <0 or >1? usually clamped or extrapolated.
    // But strictly speaking, we lost history for 150.
    
    // Let's just verify capacity logic by checking if we can interpolate effectively only in recent range
    const bracketOld = buffer.getBracketing(150);
    // Should return based on s2, s3
    expect(bracketOld?.a.tick).toBe(2);
    expect(bracketOld?.b.tick).toBe(3);
  });

  it('should find correct bracketing snapshots', () => {
    const buffer = new SnapshotBuffer(10);
    const s1 = { ...createEmptySnapshot(), tick: 1, timeMs: 100 };
    const s2 = { ...createEmptySnapshot(), tick: 2, timeMs: 200 };
    buffer.push(s1);
    buffer.push(s2);

    const bracket = buffer.getBracketing(150);
    expect(bracket).toBeDefined();
    expect(bracket?.a).toBe(s1);
    expect(bracket?.b).toBe(s2);
    expect(bracket?.alpha).toBe(0.5);
  });

  it('should throw on non-monotonic updates', () => {
    const buffer = new SnapshotBuffer(10);
    const s1 = { ...createEmptySnapshot(), tick: 2, timeMs: 200 };
    buffer.push(s1);

    const s2 = { ...createEmptySnapshot(), tick: 1, timeMs: 300 };
    expect(() => buffer.push(s2)).toThrow(/monotonic/);
  });
});

