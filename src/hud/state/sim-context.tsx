import * as React from 'react';
import type { SimStore } from '@/sim';

const SimContext = React.createContext<SimStore | null>(null);

export function SimStoreProvider({
  store,
  children,
}: {
  store: SimStore;
  children: React.ReactNode;
}) {
  return <SimContext.Provider value={store}>{children}</SimContext.Provider>;
}

export function useSimStore(): SimStore {
  const ctx = React.useContext(SimContext);
  if (!ctx) {
    throw new Error('useSimStore must be used within SimStoreProvider');
  }
  return ctx;
}
