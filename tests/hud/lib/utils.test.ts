import { describe, it, expect } from 'vitest';
import { cn } from '@/hud/lib/utils';

describe('hud utils', () => {
  it('should merge classes', () => {
    expect(cn('a', 'b')).toBe('a b');
    expect(cn('a', { b: true, c: false })).toBe('a b');
  });

  it('should handle tailwind conflicts', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });
});

