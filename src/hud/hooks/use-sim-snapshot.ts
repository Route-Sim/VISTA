import { useSyncExternalStore, useCallback } from 'react';
import { useSimStore } from '@/hud/state/sim-context';
import type { SimSnapshot } from '@/sim';

export function useSimSnapshot(): SimSnapshot {
  const store = useSimStore();

  const subscribe = useCallback(
    (callback: () => void) => {
      return store.subscribe(callback);
    },
    [store],
  );

  const getSnapshot = useCallback(() => {
    return store.getWorkingDraft();
  }, [store]);

  return useSyncExternalStore(subscribe, getSnapshot);
}

