import * as React from 'react';
import { Play } from 'lucide-react';
import { HudContainer } from '@/hud/components/hud-container';
import { Button } from '@/hud/ui/button';
import { Slider } from '@/hud/ui/slider';
import type { PlaybackController } from '@/hud/api/playback';
import { usePlaybackState } from '@/hud/state/playback-state';
import { cn } from '../lib/utils';

const TICK_RATE_STORAGE_KEY = 'hud:tickRateHz';

function readInitialTickRate(): number {
  try {
    const raw = localStorage.getItem(TICK_RATE_STORAGE_KEY);
    const parsed = raw ? Number(raw) : NaN;
    if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 100) return parsed;
  } catch {}
  return 30;
}

function persistTickRate(hz: number): void {
  try {
    localStorage.setItem(TICK_RATE_STORAGE_KEY, String(hz));
  } catch {}
}

type StartSimulationProps = {
  controller?: PlaybackController;
  className?: string;
};

export function StartSimulation({
  controller,
  className,
}: StartSimulationProps): React.ReactNode {
  const { setStatus } = usePlaybackState();
  const [tickRateHz, setTickRateHz] = React.useState<number>(
    readInitialTickRate(),
  );
  const [dragHz, setDragHz] = React.useState<number | null>(null);

  const commitTickRate = React.useCallback(
    (hz: number) => {
      const clamped = Math.max(1, Math.min(100, Math.round(hz)));
      setTickRateHz(clamped);
      persistTickRate(clamped);
      controller?.commandSink?.({ type: 'setTickRate', hz: clamped });
    },
    [controller],
  );

  const handleStart = React.useCallback(() => {
    // Ensure tick rate is set before starting
    const currentHz = dragHz ?? tickRateHz;
    commitTickRate(currentHz);
    // Update playback state immediately
    setStatus('playing');
    // Send command to network (will use the tick rate from controller's ref)
    controller?.commandSink?.({ type: 'play' });
  }, [controller, setStatus, tickRateHz, dragHz, commitTickRate]);

  const displayHz = dragHz ?? tickRateHz;

  return (
    <HudContainer
      id="start-simulation"
      title="Start Simulation"
      description="Ready to begin? Configure tick rate and start the simulation."
      closable={false}
      className={cn('flex h-full flex-col', className)}
    >
      <div className="m-8 flex flex-1 flex-col items-center justify-center gap-4">
        <div className="w-full max-w-sm space-y-4">
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

          <Button
            onClick={handleStart}
            size="lg"
            className="h-12 w-full px-8 text-base"
            aria-label="Start Simulation"
          >
            <Play className="mr-2 h-5 w-5" />
            Start Simulation
          </Button>
        </div>
      </div>
    </HudContainer>
  );
}
