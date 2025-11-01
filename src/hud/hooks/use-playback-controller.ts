import * as React from 'react';
import type { PlaybackCommand, PlaybackController } from '@/hud/api/playback';
import { net } from '@/net';

const TICK_RATE_STORAGE_KEY = 'hud:tickRateHz';

function readInitialTickRate(): number {
  try {
    const raw = localStorage.getItem(TICK_RATE_STORAGE_KEY);
    const parsed = raw ? Number(raw) : NaN;
    if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 240) return parsed;
  } catch {}
  return 60;
}

export function usePlaybackNetController(): PlaybackController {
  const tickRateRef = React.useRef<number>(readInitialTickRate());

  React.useEffect(() => {
    net.connect();
  }, []);

  const commandSink = React.useCallback(async (cmd: PlaybackCommand) => {
    try {
      switch (cmd.type) {
        case 'setTickRate': {
          tickRateRef.current = cmd.hz;
          await net.sendAction('tick_rate.update', { tick_rate: cmd.hz });
          break;
        }
        case 'play': {
          const hz = tickRateRef.current;
          await net.sendAction('simulation.start', { tick_rate: hz });
          break;
        }
        case 'resume': {
          await net.sendAction('simulation.resume', {});
          break;
        }
        case 'stop': {
          await net.sendAction('simulation.stop', {});
          break;
        }
        case 'pause': {
          // No server-side pause; keep local-only for now
          break;
        }
      }
    } catch (err) {
      // Swallow or log for now; future: surface via HUD toast
      // eslint-disable-next-line no-console
      console.debug('playback command error', cmd, err);
    }
  }, []);

  return { commandSink };
}


