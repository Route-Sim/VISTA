/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import * as THREE from 'three';

import { focusStore, useFocusState } from '@/hud/state/focus-state';

describe('focus-state', () => {
  beforeEach(() => {
    // Reset internal focus state between tests
    focusStore.clearFocus();
  });

  it('provides default focus state via hook', () => {
    const { result } = renderHook(() => useFocusState());

    expect(result.current.focusedId).toBeNull();
    expect(result.current.focusedType).toBeNull();
    expect(result.current.focusedPosition).toBeNull();
  });

  it('setFocus updates state and notifies subscribers', () => {
    const listener = vi.fn();
    const unsubscribe = focusStore.subscribe(listener);

    const position = new THREE.Vector3(1, 2, 3);

    act(() => {
      focusStore.setFocus('n1', 'node', position);
    });

    const state = focusStore.getState();
    expect(state.focusedId).toBe('n1');
    expect(state.focusedType).toBe('node');
    expect(state.focusedPosition).toBe(position);
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
  });

  it('clearFocus resets state and emits only when focusedId is set', () => {
    const listener = vi.fn();
    focusStore.subscribe(listener);

    // First call when nothing is focused should be a no-op
    act(() => {
      focusStore.clearFocus();
    });
    expect(listener).not.toHaveBeenCalled();

    // Set focus, then clear
    act(() => {
      focusStore.setFocus('a1', 'agent');
    });
    act(() => {
      focusStore.clearFocus();
    });

    const state = focusStore.getState();
    expect(state.focusedId).toBeNull();
    expect(state.focusedType).toBeNull();
    expect(state.focusedPosition).toBeNull();
    expect(listener).toHaveBeenCalledTimes(2); // one for setFocus, one for clearFocus
  });

  it('setFocus is a no-op when called with identical state', () => {
    const listener = vi.fn();
    focusStore.subscribe(listener);

    const position = new THREE.Vector3(0, 0, 0);

    act(() => {
      focusStore.setFocus('n1', 'node', position);
    });
    listener.mockClear();

    act(() => {
      // Same id, type, and position reference -> no emit
      focusStore.setFocus('n1', 'node', position);
    });

    expect(listener).not.toHaveBeenCalled();
    const state = focusStore.getState();
    expect(state.focusedId).toBe('n1');
    expect(state.focusedType).toBe('node');
    expect(state.focusedPosition).toBe(position);
  });
});


