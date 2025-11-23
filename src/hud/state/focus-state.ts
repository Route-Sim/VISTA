import { useSyncExternalStore } from 'react';
import type * as THREE from 'three';

export type FocusType = 'node' | 'road' | 'building' | 'agent' | 'tree';

interface FocusState {
  focusedId: string | null;
  focusedType: FocusType | null;
  focusedPosition: THREE.Vector3 | null;
}

let currentState: FocusState = {
  focusedId: null,
  focusedType: null,
  focusedPosition: null,
};

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export const focusStore = {
  getState: () => currentState,
  setFocus: (id: string, type: FocusType, position?: THREE.Vector3) => {
    if (
      currentState.focusedId === id &&
      currentState.focusedType === type &&
      currentState.focusedPosition === (position || null)
    )
      return;
    currentState = {
      focusedId: id,
      focusedType: type,
      focusedPosition: position || null,
    };
    emit();
  },
  clearFocus: () => {
    if (!currentState.focusedId) return;
    currentState = {
      focusedId: null,
      focusedType: null,
      focusedPosition: null,
    };
    emit();
  },
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useFocusState() {
  const state = useSyncExternalStore(focusStore.subscribe, focusStore.getState);
  return {
    ...state,
    setFocus: focusStore.setFocus,
    clearFocus: focusStore.clearFocus,
  };
}
