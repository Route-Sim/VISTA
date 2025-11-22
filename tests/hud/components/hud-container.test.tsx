import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HudContainer } from '@/hud/components/hud-container';
import { useHudVisibility } from '@/hud/state/hud-visibility';

// Mock HUD visibility context
vi.mock('@/hud/state/hud-visibility', () => ({
  useHudVisibility: vi.fn(),
}));

describe('HudContainer', () => {
  it('should not render when not visible', () => {
    vi.mocked(useHudVisibility).mockReturnValue({
      isVisible: () => false,
      state: {},
      setVisible: vi.fn(),
      toggle: vi.fn(),
    });

    const { container } = render(
      <HudContainer id="play-controls" title="Test">
        Content
      </HudContainer>
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should render content when visible', () => {
    vi.mocked(useHudVisibility).mockReturnValue({
      isVisible: () => true,
      state: {},
      setVisible: vi.fn(),
      toggle: vi.fn(),
    });

    render(
      <HudContainer id="play-controls" title="Test Panel">
        <div data-testid="content">Hello</div>
      </HudContainer>
    );

    expect(screen.getByText('Test Panel')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('should call setVisible(false) on close', () => {
    const setVisible = vi.fn();
    vi.mocked(useHudVisibility).mockReturnValue({
      isVisible: () => true,
      state: {},
      setVisible,
      toggle: vi.fn(),
    });

    render(
      <HudContainer id="play-controls" title="Test Panel">
        Content
      </HudContainer>
    );

    // Find close button (it has title="Hide" or aria-label="Hide Test Panel")
    const closeBtn = screen.getByTitle('Hide');
    fireEvent.click(closeBtn);

    expect(setVisible).toHaveBeenCalledWith('play-controls', false);
  });

  it('should hide close button if closable=false', () => {
    vi.mocked(useHudVisibility).mockReturnValue({
      isVisible: () => true,
      state: {},
      setVisible: vi.fn(),
      toggle: vi.fn(),
    });

    render(
      <HudContainer id="play-controls" title="Test Panel" closable={false}>
        Content
      </HudContainer>
    );

    expect(screen.queryByTitle('Hide')).not.toBeInTheDocument();
  });
});

