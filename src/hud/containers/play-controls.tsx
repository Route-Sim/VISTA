import * as React from 'react';
import { Pause, Play, Square } from 'lucide-react';
import { HudContainer } from '@/hud/components/hud-container';
import { Button } from '@/hud/ui/button';
import { Slider } from '@/hud/ui/slider';
import { Separator } from '@/hud/ui/separator';
import type {
  PlaybackCommand,
  PlaybackController,
  PlaybackState,
  PlaybackStatus,
} from '@/hud/api/playback';

const TICK_RATE_STORAGE_KEY = 'hud:tickRateHz';

function readInitialTickRate(): number {
  try {
    const raw = localStorage.getItem(TICK_RATE_STORAGE_KEY);
    const parsed = raw ? Number(raw) : NaN;
    if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 240) return parsed;
  } catch {}
  return 60;
}

function persistTickRate(hz: number): void {
  try {
    localStorage.setItem(TICK_RATE_STORAGE_KEY, String(hz));
  } catch {}
}

type PlayControlsProps = {
  controller?: PlaybackController;
};

export function PlayControls({
  controller,
}: PlayControlsProps): React.ReactNode {
  const initial: PlaybackState = {
    status: controller?.initialState?.status ?? 'idle',
    tickRateHz: controller?.initialState?.tickRateHz ?? readInitialTickRate(),
  };

  const [status, setStatus] = React.useState<PlaybackStatus>(initial.status);
  const [tickRateHz, setTickRateHz] = React.useState<number>(
    initial.tickRateHz,
  );
  const [dragHz, setDragHz] = React.useState<number | null>(null);
  const sink = controller?.commandSink;

  const commitTickRate = React.useCallback(
    (hz: number) => {
      const clamped = Math.max(1, Math.min(240, Math.round(hz)));
      setTickRateHz(clamped);
      persistTickRate(clamped);
      const cmd: PlaybackCommand = { type: 'setTickRate', hz: clamped };
      sink?.(cmd);
    },
    [sink],
  );

  const issue = React.useCallback(
    (cmd: PlaybackCommand) => {
      sink?.(cmd);
      switch (cmd.type) {
        case 'play':
        case 'resume':
          setStatus('playing');
          break;
        case 'pause':
          setStatus('paused');
          break;
        case 'stop':
          setStatus('stopped');
          break;
        case 'setTickRate':
          // handled by commitTickRate
          break;
      }
    },
    [sink],
  );

  const displayHz = dragHz ?? tickRateHz;

  return (
    <HudContainer id="play-controls" title="Play Controls">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="text-xs text-black/70">Status</div>
          <div className="text-xs font-medium text-black/90 capitalize">
            {status}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status === 'playing' ? (
            <Button
              aria-label="Pause"
              variant="secondary"
              onClick={() => issue({ type: 'pause' })}
              className="h-8"
            >
              <Pause />
              Pause
            </Button>
          ) : (
            <Button
              aria-label={status === 'paused' ? 'Resume' : 'Play'}
              onClick={() =>
                issue({ type: status === 'paused' ? 'resume' : 'play' })
              }
              className="h-8"
            >
              <Play />
              {status === 'paused' ? 'Resume' : 'Play'}
            </Button>
          )}

          <Button
            aria-label="Stop"
            variant="outline"
            onClick={() => issue({ type: 'stop' })}
            className="h-8"
          >
            <Square />
            Stop
          </Button>
        </div>

        <Separator className="bg-black/10" />

        <div className="flex items-center gap-3">
          <div className="w-[180px]">
            <Slider
              min={1}
              max={240}
              step={1}
              value={[displayHz]}
              onValueChange={(v) => setDragHz(v[0] ?? 60)}
              onPointerDown={() => void 0}
              onPointerUp={() => {
                const next = dragHz ?? tickRateHz;
                setDragHz(null);
                commitTickRate(next);
              }}
              aria-label="Tick rate"
            />
          </div>
          <div className="w-[48px] text-right text-xs text-black/80 tabular-nums">
            {displayHz} Hz
          </div>
        </div>
      </div>
    </HudContainer>
  );
}
