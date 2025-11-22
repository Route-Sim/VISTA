import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useHudHotkeys } from '@/hud/hooks/use-hud-hotkeys';
import { useHudVisibility } from '@/hud/state/hud-visibility';

// Mock the context hook
vi.mock('@/hud/state/hud-visibility', () => ({
  useHudVisibility: vi.fn(),
}));

describe('useHudHotkeys', () => {
  it('should toggle net-events on KeyN', () => {
    const toggle = vi.fn();
    vi.mocked(useHudVisibility).mockReturnValue({ toggle, isVisible: false });

    renderHook(() => useHudHotkeys());

    const event = new KeyboardEvent('keydown', { code: 'KeyN' });
    window.dispatchEvent(event);

    expect(toggle).toHaveBeenCalledWith('net-events');
  });

  it('should ignore repeat events', () => {
    const toggle = vi.fn();
    vi.mocked(useHudVisibility).mockReturnValue({ toggle, isVisible: false });

    renderHook(() => useHudHotkeys());

    const event = new KeyboardEvent('keydown', { code: 'KeyN', repeat: true });
    window.dispatchEvent(event);

    expect(toggle).not.toHaveBeenCalled();
  });

  it('should ignore other keys', () => {
    const toggle = vi.fn();
    vi.mocked(useHudVisibility).mockReturnValue({ toggle, isVisible: false });

    renderHook(() => useHudHotkeys());

    const event = new KeyboardEvent('keydown', { code: 'KeyX' });
    window.dispatchEvent(event);

    expect(toggle).not.toHaveBeenCalled();
  });

  it('should cleanup listener on unmount', () => {
    const toggle = vi.fn();
    vi.mocked(useHudVisibility).mockReturnValue({ toggle, isVisible: false });

    const { unmount } = renderHook(() => useHudHotkeys());
    
    // Spy on removeEventListener
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    
    unmount();

    // We can't easily check if the specific function was removed without reference,
    // but we can check if removeEventListener was called.
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});

