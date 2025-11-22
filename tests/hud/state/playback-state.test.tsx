import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  PlaybackStateProvider,
  usePlaybackState,
} from '@/hud/state/playback-state';

describe('PlaybackStateContext', () => {
  it('should provide default status', () => {
    const { result } = renderHook(() => usePlaybackState(), {
      wrapper: PlaybackStateProvider,
    });

    expect(result.current.status).toBe('idle');
  });

  it('should update status', () => {
    const { result } = renderHook(() => usePlaybackState(), {
      wrapper: PlaybackStateProvider,
    });

    act(() => {
      result.current.setStatus('running');
    });
    expect(result.current.status).toBe('running');

    act(() => {
      result.current.setStatus('paused');
    });
    expect(result.current.status).toBe('paused');
  });

  it('should throw if used outside provider', () => {
    // Suppress console error for this test as React logs uncaught errors
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => usePlaybackState());
    }).toThrow('usePlaybackState must be used within PlaybackStateProvider');
    
    consoleSpy.mockRestore();
  });
});

