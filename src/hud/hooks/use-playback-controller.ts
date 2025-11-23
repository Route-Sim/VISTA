import * as React from 'react';
import type { PlaybackCommand, PlaybackController } from '@/hud/api/playback';
import { net } from '@/net';

const TICK_RATE_STORAGE_KEY = 'hud:tickRate';
const SPEED_STORAGE_KEY = 'hud:speed';

function readInitialTickRate(): number {
  try {
    const raw = localStorage.getItem(TICK_RATE_STORAGE_KEY);
    const parsed = raw ? Number(raw) : NaN;
    if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 100) return parsed;
  } catch {}
  return 30;
}

function readInitialSpeed(): number {
  try {
    const raw = localStorage.getItem(SPEED_STORAGE_KEY);
    const parsed = raw ? Number(raw) : NaN;
    if (Number.isFinite(parsed) && parsed >= 0.1 && parsed <= 10.0)
      return parsed;
  } catch {}
  return 1.0;
}

export function usePlaybackNetController(): PlaybackController {
  const tickRateRef = React.useRef<number>(readInitialTickRate());
  const speedRef = React.useRef<number>(readInitialSpeed());

  React.useEffect(() => {
    net.connect();
  }, []);

  const commandSink = React.useCallback(async (cmd: PlaybackCommand) => {
    try {
      switch (cmd.type) {
        case 'play': {
          const tickRate = tickRateRef.current;
          const speed = speedRef.current;
          await net.sendAction('simulation.start', {
            tick_rate: tickRate,
            speed: speed,
          });
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
          await net.sendAction('simulation.pause', {});
          break;
        }
        case 'update': {
          tickRateRef.current = cmd.tickRate;
          speedRef.current = cmd.speed;
          await net.sendAction('simulation.update', {
            tick_rate: cmd.tickRate,
            speed: cmd.speed,
          });
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
