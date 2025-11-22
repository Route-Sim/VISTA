import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExponentialBackoff } from '@/net/backoff';

describe('ExponentialBackoff', () => {
  it('should start with initial delay', () => {
    const backoff = new ExponentialBackoff({
      initialDelayMs: 100,
      jitterRatio: 0,
    });
    expect(backoff.nextDelayMs()).toBe(100);
  });

  it('should increase delay exponentially', () => {
    const backoff = new ExponentialBackoff({
      initialDelayMs: 10,
      factor: 2,
      jitterRatio: 0,
    });

    expect(backoff.nextDelayMs()).toBe(10); // 10 * 2^0
    expect(backoff.nextDelayMs()).toBe(20); // 10 * 2^1
    expect(backoff.nextDelayMs()).toBe(40); // 10 * 2^2
  });

  it('should respect max delay', () => {
    const backoff = new ExponentialBackoff({
      initialDelayMs: 100,
      factor: 10,
      maxDelayMs: 500,
      jitterRatio: 0,
    });

    expect(backoff.nextDelayMs()).toBe(100);
    expect(backoff.nextDelayMs()).toBe(500); // clamped
    expect(backoff.nextDelayMs()).toBe(500); // still clamped
  });

  it('should reset attempts', () => {
    const backoff = new ExponentialBackoff({
      initialDelayMs: 10,
      factor: 2,
      jitterRatio: 0,
    });

    backoff.nextDelayMs(); // 10
    backoff.nextDelayMs(); // 20
    backoff.reset();
    expect(backoff.nextDelayMs()).toBe(10);
  });

  it('should apply jitter', () => {
    // This is a probabilistic test, but with 0.2 jitter on 100ms base,
    // result should be between 80 and 120.
    // We can't strictly predict random, but we can check bounds.
    const backoff = new ExponentialBackoff({
      initialDelayMs: 100,
      jitterRatio: 0.2,
    });

    for (let i = 0; i < 10; i++) {
      // reset each time to keep base at 100
      backoff.reset();
      const delay = backoff.nextDelayMs();
      expect(delay).toBeGreaterThanOrEqual(80);
      expect(delay).toBeLessThanOrEqual(120);
    }
  });
});


