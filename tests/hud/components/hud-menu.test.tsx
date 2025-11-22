import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HudMenu } from '@/hud/components/hud-menu';
import { useHudVisibility } from '@/hud/state/hud-visibility';
import type { HudPanelId } from '@/hud/state/hud-visibility';

vi.mock('@/hud/state/hud-visibility', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hud/state/hud-visibility')>();
  return {
    ...actual,
    useHudVisibility: vi.fn(),
  };
});

describe('HudMenu', () => {
  it('should render trigger button', () => {
    vi.mocked(useHudVisibility).mockReturnValue({
      state: {},
      isVisible: vi.fn(),
      setVisible: vi.fn(),
      toggle: vi.fn(),
    });

    render(<HudMenu />);
    expect(screen.getByText('HUD')).toBeInTheDocument();
  });

  it('should show menu items when clicked', async () => {
    const setVisible = vi.fn();
    vi.mocked(useHudVisibility).mockReturnValue({
      state: { 'play-controls': true, 'net-events': false } as Record<HudPanelId, boolean>,
      isVisible: vi.fn(),
      setVisible,
      toggle: vi.fn(),
    });

    render(<HudMenu />);
    
    // Open menu
    const trigger = screen.getByText('HUD');
    fireEvent.pointerDown(trigger); // DropdownMenu uses pointer events

    // Check for panel labels
    expect(await screen.findByText('Play Controls')).toBeInTheDocument();
    expect(await screen.findByText('Net Events')).toBeInTheDocument();

    // Click an item
    const item = screen.getByText('Net Events');
    fireEvent.click(item);

    expect(setVisible).toHaveBeenCalledWith('net-events', true);
  });
});

