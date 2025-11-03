import * as React from 'react';
import { Pause, Play } from 'lucide-react';
import { HudContainer } from '@/hud/components/hud-container';
import { Button } from '@/hud/ui/button';
import { Slider } from '@/hud/ui/slider';
import { usePlaybackState } from '@/hud/state/playback-state';
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
  const { status: globalStatus, setStatus: setGlobalStatus } =
    usePlaybackState();
  const initial: PlaybackState = {
    status: globalStatus ?? controller?.initialState?.status ?? 'idle',
    tickRateHz: controller?.initialState?.tickRateHz ?? readInitialTickRate(),
  };

  const [status, setStatus] = React.useState<PlaybackStatus>(initial.status);
  const [tickRateHz, setTickRateHz] = React.useState<number>(
    initial.tickRateHz,
  );
  const [dragHz, setDragHz] = React.useState<number | null>(null);
  const sink = controller?.commandSink;

  // Sync local status with global playback state
  React.useEffect(() => {
    setGlobalStatus(status);
  }, [status, setGlobalStatus]);

  // Sync global status to local when it changes externally (e.g., from StartSimulation)
  React.useEffect(() => {
    if (globalStatus !== status) {
      setStatus(globalStatus);
    }
  }, [globalStatus]);

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
        case 'resume':
          setStatus('playing');
          break;
        case 'pause':
          setStatus('paused');
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
    <HudContainer
      id="play-controls"
      title="Play Controls"
      description="Control the playback of the simulation."
    >
      <div className="flex flex-col gap-6 py-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-black/70">Tick Rate</span>
            <span className="text-sm font-medium text-black/90 tabular-nums">
              {displayHz} Hz
            </span>
          </div>
          <Slider
            min={1}
            max={100}
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

        <div className="flex flex-col gap-2 self-end">
          {(status === 'playing' || status === 'paused') && (
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
                  aria-label="Resume"
                  onClick={() => issue({ type: 'resume' })}
                  className="h-8"
                >
                  <Play />
                  Resume
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </HudContainer>
  );
}
