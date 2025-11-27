/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import * as React from 'react';
import { CameraHelp } from '@/hud/containers/camera-help';
import { HudVisibilityProvider } from '@/hud/state/hud-visibility';

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<HudVisibilityProvider>{ui}</HudVisibilityProvider>);
};

describe('CameraHelp', () => {
  afterEach(() => {
    cleanup();
  });
  it('should render camera help container', () => {
    renderWithProvider(<CameraHelp />);
    expect(screen.getByText('Camera & Movement')).toBeTruthy();
  });

  it('should display all keyboard shortcuts', () => {
    const { container } = renderWithProvider(<CameraHelp />);
    expect(container.textContent).toContain('Move Forward/Backward');
    expect(container.textContent).toContain('Move Left/Right');
    expect(container.textContent).toContain('Move Up/Down');
    expect(container.textContent).toContain('Orbit');
    expect(container.textContent).toContain('Pan');
    expect(container.textContent).toContain('Zoom');
  });

  it('should display key caps for controls', () => {
    const { container } = renderWithProvider(<CameraHelp />);
    
    expect(container.textContent).toContain('W');
    expect(container.textContent).toContain('S');
    expect(container.textContent).toContain('A');
    expect(container.textContent).toContain('D');
    expect(container.textContent).toContain('Space');
    expect(container.textContent).toContain('Shift');
    expect(container.textContent).toContain('Left Mouse');
    expect(container.textContent).toContain('Right Mouse');
    expect(container.textContent).toContain('Middle');
    expect(container.textContent).toContain('Scroll');
  });
});
