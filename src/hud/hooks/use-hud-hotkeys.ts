import * as React from 'react';
import { useHudVisibility } from '@/hud/state/hud-visibility';

export function useHudHotkeys(): void {
  const { toggle } = useHudVisibility();

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      // Toggle Net Events panel with "N"
      if (e.code === 'KeyN') {
        toggle('net-events');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggle]);
}


