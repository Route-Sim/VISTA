/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';

import { SimStoreProvider, useSimStore } from '@/hud/state/sim-context';
import type { SimStore } from '@/sim';

describe('SimContext', () => {
  it('provides SimStore instance via provider', () => {
    const fakeStore = {
      ingest: () => {},
      subscribe: () => () => {},
      getSnapshotAt: () => null,
      getCurrentSnapshot: () => null,
    } as unknown as SimStore;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SimStoreProvider store={fakeStore}>{children}</SimStoreProvider>
    );

    const { result } = renderHook(() => useSimStore(), { wrapper });

    expect(result.current).toBe(fakeStore);
  });

  it('throws when useSimStore is called outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useSimStore());
    }).toThrow('useSimStore must be used within SimStoreProvider');

    consoleSpy.mockRestore();
  });
});


