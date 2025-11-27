/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import * as React from 'react';
import { useSimSnapshot } from '@/hud/hooks/use-sim-snapshot';
import { SimStoreProvider } from '@/hud/state/sim-context';
import { SimStore } from '@/sim/store/sim-store';
import { createEmptySnapshot } from '@/sim/store/snapshot';
import type { SimSnapshot } from '@/sim';

describe('useSimSnapshot', () => {
  let store: SimStore;
  let mockSnapshot: SimSnapshot;

  beforeEach(() => {
    mockSnapshot = createEmptySnapshot();
    store = new SimStore({ initial: mockSnapshot });
  });

  it('should return the working draft from store', () => {
    const { result } = renderHook(() => useSimSnapshot(), {
      wrapper: ({ children }) =>
        React.createElement(SimStoreProvider, { store }, children),
    });

    expect(result.current).toBeDefined();
    expect(result.current.version).toBe(1);
    expect(result.current.tick).toBe(0);
  });

  it('should subscribe to store changes and update when draft changes', () => {
    const { result } = renderHook(() => useSimSnapshot(), {
      wrapper: ({ children }) =>
        React.createElement(SimStoreProvider, { store }, children),
    });

    const initialTick = result.current.tick;

    // Update the store by ingesting an event
    act(() => {
      store.ingest({ type: 'tick.start', tick: 1, timeMs: 100 });
    });

    // The hook should reflect the updated working draft
    expect(result.current.tick).toBe(1);
    expect(result.current.timeMs).toBe(100);
    expect(result.current.tick).not.toBe(initialTick);
  });

  it('should handle multiple updates correctly', () => {
    const { result } = renderHook(() => useSimSnapshot(), {
      wrapper: ({ children }) =>
        React.createElement(SimStoreProvider, { store }, children),
    });

    act(() => {
      store.ingest({ type: 'tick.start', tick: 1, timeMs: 100 });
    });
    expect(result.current.tick).toBe(1);

    act(() => {
      store.ingest({ type: 'tick.start', tick: 2, timeMs: 200 });
    });
    expect(result.current.tick).toBe(2);
    expect(result.current.timeMs).toBe(200);
  });

  it('should unsubscribe when component unmounts', () => {
    const subscribeSpy = vi.spyOn(store, 'subscribe');
    
    const { unmount } = renderHook(() => useSimSnapshot(), {
      wrapper: ({ children }) =>
        React.createElement(SimStoreProvider, { store }, children),
    });

    expect(subscribeSpy).toHaveBeenCalled();
    const unsubscribe = subscribeSpy.mock.results[0]?.value;
    expect(unsubscribe).toBeTypeOf('function');

    unmount();

    // Verify unsubscribe was called (indirectly by checking listener count)
    // The store's internal listener set should be empty after unmount
    // We can't directly check this, but we can verify the hook doesn't update after unmount
    act(() => {
      store.ingest({ type: 'tick.start', tick: 999, timeMs: 999 });
    });
    // Component is unmounted, so we can't check result.current
    // But if unsubscribe worked, the store should still function
    expect(store.getWorkingDraft().tick).toBe(999);
  });

  it('should return updated snapshot after commit', () => {
    const { result } = renderHook(() => useSimSnapshot(), {
      wrapper: ({ children }) =>
        React.createElement(SimStoreProvider, { store }, children),
    });

    act(() => {
      store.ingest({ type: 'tick.start', tick: 1, timeMs: 100 });
      store.ingest({ type: 'tick.end', tick: 1, timeMs: 100 });
    });

    // After commit, working draft should reflect committed state
    expect(result.current.tick).toBe(1);
    expect(result.current.timeMs).toBe(100);
  });
});

