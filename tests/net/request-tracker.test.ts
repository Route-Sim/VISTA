import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RequestTracker } from '@/net/request-tracker';
import type { SignalUnion } from '@/net/protocol/schema';

describe('RequestTracker', () => {
  let tracker: RequestTracker;

  beforeEach(() => {
    vi.useFakeTimers();
    tracker = new RequestTracker(1000);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should resolve when a matching signal arrives', async () => {
    const promise = tracker.waitFor((s) => s.signal === 'simulation.started', {
      timeoutMs: 5000,
    });

    const signal: SignalUnion = {
      signal: 'simulation.started',
      data: { tick_rate: 10 },
      request_id: 'req-1',
    };

    // Should return true indicating handled
    const handled = tracker.handleSignal(signal);
    expect(handled).toBe(true);

    await expect(promise).resolves.toEqual(signal);
  });

  it('should not resolve for non-matching signal', () => {
    const promise = tracker.waitFor((s) => s.signal === 'simulation.started');

    const signal: SignalUnion = {
      signal: 'agent.created',
      data: {
        id: 'a1',
        kind: 'truck',
        inbox_count: 0,
        outbox_count: 0,
        tags: {},
        current_speed_kph: 0,
        max_speed_kph: 100,
        current_node: null,
        current_edge: null,
        edge_progress_m: 0,
        route: [],
        destination: null,
        route_start_node: null,
        route_end_node: null,
        current_building_id: null,
      },
    };

    const handled = tracker.handleSignal(signal);
    expect(handled).toBe(false);

    // Promise should still be pending (we can't easily check "is pending" without timeout,
    // but we verified handleSignal returned false)
  });

  it('should timeout if no signal arrives', async () => {
    const promise = tracker.waitFor(
      () => false, // never matches
      { timeoutMs: 100 },
    );

    vi.advanceTimersByTime(101);

    await expect(promise).rejects.toThrow('Request timed out');
  });

  it('should respect request_id in handling', async () => {
    const promise = tracker.waitFor((s) => s.signal === 'simulation.started', {
      requestId: 'req-123',
    });

    // Same signal, different request_id -> should be ignored
    tracker.handleSignal({
      signal: 'simulation.started',
      data: { tick_rate: 10 },
      request_id: 'req-999',
    });

    // Correct request_id
    const correctSignal: SignalUnion = {
      signal: 'simulation.started',
      data: { tick_rate: 10 },
      request_id: 'req-123',
    };
    const handled = tracker.handleSignal(correctSignal);
    expect(handled).toBe(true);

    await expect(promise).resolves.toEqual(correctSignal);
  });

  it('should cancel all pending requests', async () => {
    const p1 = tracker.waitFor(() => false);
    const p2 = tracker.waitFor(() => false);

    tracker.cancelAll('Connection lost');

    await expect(p1).rejects.toThrow('Connection lost');
    await expect(p2).rejects.toThrow('Connection lost');
  });
});

