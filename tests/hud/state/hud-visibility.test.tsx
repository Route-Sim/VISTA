import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  HudVisibilityProvider,
  useHudVisibility,
  HUD_PANELS
} from '@/hud/state/hud-visibility';

describe('HudVisibilityContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should provide default visibility', () => {
    const { result } = renderHook(() => useHudVisibility(), {
      wrapper: HudVisibilityProvider,
    });

    expect(result.current.isVisible('play-controls')).toBe(true);
    expect(result.current.isVisible('net-events')).toBe(false);
  });

  it('should toggle visibility', () => {
    const { result } = renderHook(() => useHudVisibility(), {
      wrapper: HudVisibilityProvider,
    });

    expect(result.current.isVisible('net-events')).toBe(false);

    act(() => {
      result.current.toggle('net-events');
    });

    expect(result.current.isVisible('net-events')).toBe(true);
  });

  it('should set explicit visibility', () => {
    const { result } = renderHook(() => useHudVisibility(), {
      wrapper: HudVisibilityProvider,
    });

    act(() => {
      result.current.setVisible('camera-help', false);
    });
    expect(result.current.isVisible('camera-help')).toBe(false);

    act(() => {
      result.current.setVisible('camera-help', true);
    });
    expect(result.current.isVisible('camera-help')).toBe(true);
  });

  it('should persist to localStorage', () => {
    const { result } = renderHook(() => useHudVisibility(), {
      wrapper: HudVisibilityProvider,
    });

    act(() => {
      result.current.toggle('net-events');
    });

    const stored = localStorage.getItem('hud:panels:v1');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed['net-events']).toBe(true);
  });

  it('should rehydrate from localStorage', () => {
    // Seed storage
    const state = { 'net-events': true };
    localStorage.setItem('hud:panels:v1', JSON.stringify(state));

    const { result } = renderHook(() => useHudVisibility(), {
      wrapper: HudVisibilityProvider,
    });

    expect(result.current.isVisible('net-events')).toBe(true);
    // Should fall back to default for others
    expect(result.current.isVisible('play-controls')).toBe(true);
  });

  it('should list known panels', () => {
    expect(HUD_PANELS).toContain('play-controls');
    expect(HUD_PANELS).toContain('agent-inspector');
  });
});

