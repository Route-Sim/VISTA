import * as React from 'react';
import { Play } from 'lucide-react';
import { HudContainer } from '@/hud/components/hud-container';
import { Button } from '@/hud/ui/button';
import { Slider } from '@/hud/ui/slider';
import type { PlaybackController } from '@/hud/api/playback';
import { usePlaybackState } from '@/hud/state/playback-state';
import { cn } from '../lib/utils';

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

function persistTickRate(hz: number): void {
  try {
    localStorage.setItem(TICK_RATE_STORAGE_KEY, String(hz));
  } catch {}
}

function persistSpeed(speed: number): void {
  try {
    localStorage.setItem(SPEED_STORAGE_KEY, String(speed));
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

  const [tickRate, setTickRate] = React.useState<number>(readInitialTickRate());
  const [dragTickRate, setDragTickRate] = React.useState<number | null>(null);

  const [speed, setSpeed] = React.useState<number>(readInitialSpeed());
  const [dragSpeed, setDragSpeed] = React.useState<number | null>(null);

  const commitUpdate = React.useCallback(
    (tickRate: number, speed: number) => {
      const clampedTickRate = Math.max(1, Math.min(100, Math.round(tickRate)));
      const clampedSpeed = Math.max(0.1, Math.min(10.0, speed));

      setTickRate(clampedTickRate);
      persistTickRate(clampedTickRate);
      setSpeed(clampedSpeed);
      persistSpeed(clampedSpeed);
      controller?.commandSink?.({
        type: 'update',
        tickRate: clampedTickRate,
        speed: clampedSpeed,
      });
    },
    [controller],
  );

  const handleStart = React.useCallback(() => {
    // Ensure tick rate is set before starting
    const currentTickRate = dragTickRate ?? tickRate;
    const currentSpeed = dragSpeed ?? speed;

    commitUpdate(currentTickRate, currentSpeed);

    // Update playback state immediately
    setStatus('playing');

    // Send command to network (will use the tick rate from controller's ref)
    controller?.commandSink?.({ type: 'play' });
  }, [
    controller,
    setStatus,
    tickRate,
    speed,
    dragTickRate,
    dragSpeed,
    commitUpdate,
  ]);

  const displayTickRate = dragTickRate ?? tickRate;
  const displaySpeed = dragSpeed ?? speed;

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
                {displayTickRate} Hz
              </span>
            </div>
            <Slider
              min={1}
              max={100}
              step={1}
              value={[displayTickRate]}
              onValueChange={(v) => setDragTickRate(v[0] ?? 30)}
              onPointerDown={() => void 0}
              onPointerUp={() => {
                const nextTickRate = dragTickRate ?? tickRate;
                setDragTickRate(null);
                commitUpdate(nextTickRate, speed);
              }}
              aria-label="Tick rate"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-black/70">Speed</span>
              <span className="text-sm font-medium text-black/90 tabular-nums">
                x{displaySpeed.toFixed(1)}
              </span>
            </div>
            <Slider
              min={0.1}
              max={10.0}
              step={0.1}
              value={[displaySpeed]}
              onValueChange={(v) => setDragSpeed(v[0] ?? 1.0)}
              onPointerDown={() => void 0}
              onPointerUp={() => {
                const nextSpeed = dragSpeed ?? speed;
                setDragSpeed(null);
                commitUpdate(tickRate, nextSpeed);
              }}
              aria-label="Speed"
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
