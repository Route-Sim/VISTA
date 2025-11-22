import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KeyCap } from '@/hud/components/key-cap';

describe('KeyCap', () => {
  it('should render children', () => {
    render(<KeyCap>Cmd+K</KeyCap>);
    expect(screen.getByText('Cmd+K')).toBeInTheDocument();
  });
});

