import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react';
import { HudContainer } from '@/hud/components/hud-container';
import { useHudVisibility } from '@/hud/state/hud-visibility';

// Mock HUD visibility context
vi.mock('@/hud/state/hud-visibility', () => ({
  useHudVisibility: vi.fn(),
}));

describe('HudContainer', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });
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

    const { container } = render(
      <HudContainer id="play-controls" title="Test Panel">
        Content
      </HudContainer>
    );

    // Find close button scoped to this container
    const { getByLabelText } = within(container);
    const closeBtn = getByLabelText('Hide Test Panel');
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

    const { container } = render(
      <HudContainer id="play-controls" title="Test Panel" closable={false}>
        Content
      </HudContainer>
    );

    // Query scoped to this container
    const { queryByTitle } = within(container);
    expect(queryByTitle('Hide')).not.toBeInTheDocument();
  });
});

