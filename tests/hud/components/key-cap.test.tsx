import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { KeyCap } from '@/hud/components/key-cap';

describe('KeyCap', () => {
  afterEach(() => {
    cleanup();
  });
  it('should render children', () => {
    render(<KeyCap>Cmd+K</KeyCap>);
    expect(screen.getByText('Cmd+K')).toBeInTheDocument();
  });
});

