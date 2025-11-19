import * as React from 'react';
import { HudContainer } from '@/hud/components/hud-container';
import { Button } from '@/hud/ui/button';
import { Input } from '@/hud/ui/input';
import { Label } from '@/hud/ui/label';
import { Slider } from '@/hud/ui/slider';
import { ScrollArea } from '@/hud/ui/scroll-area';
import { Badge } from '@/hud/ui/badge';
import { cn } from '../lib/utils';
import { net, type ActionParams, type SignalData } from '@/net';
import { usePlaybackState } from '@/hud/state/playback-state';

const SPEED_MIN_KPH = 10;
const SPEED_MAX_KPH = 140;
const SPEED_STEP_KPH = 5;
const DEFAULT_SPEED_KPH = 80;
const MAX_TRACKED_TRUCKS = 32;

type TruckCreatedEnvelope = Extract<
  SignalData['agent.created'],
  { kind: 'truck' }
>;

type TruckCreateParams = ActionParams['agent.create'];

type TruckFormState = {
  agentId: string;
  maxSpeedKph: number;
};

const initialFormState = (): TruckFormState => ({
  agentId: createTruckId(),
  maxSpeedKph: DEFAULT_SPEED_KPH,
});

export function FleetCreator({
  className,
}: {
  className?: string;
}): React.ReactNode {
  const { status } = usePlaybackState();
  const canCreate = status === 'idle' || status === 'stopped';

  const [form, setForm] = React.useState<TruckFormState>(() =>
    initialFormState(),
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [createdTrucks, setCreatedTrucks] = React.useState<
    TruckCreatedEnvelope[]
  >([]);
  const [highlightId, setHighlightId] = React.useState<string | null>(null);
  const highlightTimeoutRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const unsubscribeListed = net.on('agent.listed', (data) => {
      const trucks = data.agents
        .filter((agent) => agent.kind === 'truck')
        .map((agent) => agent as TruckCreatedEnvelope);
      setCreatedTrucks(trucks.slice(0, MAX_TRACKED_TRUCKS));
    });

    const unsubscribeCreated = net.on('agent.created', (data) => {
      if (data.kind !== 'truck') return;
      setCreatedTrucks((prev) => {
        const existingIndex = prev.findIndex((truck) => truck.id === data.id);
        if (existingIndex !== -1) {
          const clone = [...prev];
          clone.splice(existingIndex, 1);
          return [data, ...clone];
        }
        return [data, ...prev].slice(0, MAX_TRACKED_TRUCKS);
      });
      setHighlightId(data.id);
      if (typeof window !== 'undefined') {
        if (highlightTimeoutRef.current) {
          window.clearTimeout(highlightTimeoutRef.current);
        }
        highlightTimeoutRef.current = window.setTimeout(() => {
          setHighlightId(null);
        }, 3500);
      }
    });

    return () => {
      unsubscribeListed();
      unsubscribeCreated();
      if (
        typeof window !== 'undefined' &&
        highlightTimeoutRef.current !== null
      ) {
        window.clearTimeout(highlightTimeoutRef.current);
        highlightTimeoutRef.current = null;
      }
    };
  }, []);

  const handleSubmit = React.useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      let agentId = form.agentId.trim();
      if (!agentId) {
        agentId = createTruckId();
        setForm((prev) => ({ ...prev, agentId }));
      }
      if (!canCreate) {
        setErrorMessage('Simulation must be idle or stopped to add trucks.');
        return;
      }

      const clampedSpeed = clamp(
        form.maxSpeedKph,
        SPEED_MIN_KPH,
        SPEED_MAX_KPH,
      );
      if (clampedSpeed !== form.maxSpeedKph) {
        setForm((prev) => ({ ...prev, maxSpeedKph: clampedSpeed }));
      }

      const params: TruckCreateParams = {
        agent_id: agentId,
        agent_kind: 'truck',
        agent_data: {
          max_speed_kph: clampedSpeed,
        },
      };

      setIsSubmitting(true);
      setErrorMessage(null);

      try {
        const response = await net.sendAction('agent.create', params);
        if (response.signal === 'error') {
          setErrorMessage(response.data.message);
          return;
        }
        if (response.signal === 'agent.created') {
          if (response.data.kind !== 'truck') {
            return;
          }
          setForm((prev) => ({
            ...prev,
            agentId: createTruckId(),
          }));
        }
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : 'Failed to create truck.',
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, canCreate],
  );

  const handleMaxSpeedChange = React.useCallback((value: number) => {
    setForm((prev) => ({
      ...prev,
      maxSpeedKph: clamp(value, SPEED_MIN_KPH, SPEED_MAX_KPH),
    }));
  }, []);

  const handleIdChange = React.useCallback((value: string) => {
    setForm((prev) => ({ ...prev, agentId: value }));
  }, []);

  const fleetCountLabel =
    createdTrucks.length === 1
      ? '1 truck created'
      : `${createdTrucks.length} trucks created`;

  return (
    <HudContainer
      id="fleet-creator"
      title="Fleet Creator"
      description="Define truck agents before the simulation begins."
      closable={false}
      className={cn('flex h-full min-h-0 flex-col', className)}
    >
      <section className="py-3">
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="truck-id" className="text-xs text-black/70">
              Truck identifier (UUID)
            </Label>
            <div className="flex gap-2">
              <Input
                id="truck-id"
                value={form.agentId}
                placeholder="uuid"
                onChange={(event) => handleIdChange(event.target.value)}
                autoComplete="off"
                className="h-8 text-sm"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  setForm((prev) => ({ ...prev, agentId: createTruckId() }))
                }
                disabled={isSubmitting}
              >
                New UUID
              </Button>
            </div>
            <p className="text-[11px] text-black/50">
              Generated automatically; adjust only when coordinating with an
              external system.
            </p>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="truck-max-speed"
                className="text-xs text-black/70"
              >
                Max speed (km/h)
              </Label>
              <span className="text-xs text-black/50">
                {form.maxSpeedKph} km/h
              </span>
            </div>
            <Slider
              id="truck-max-speed"
              min={SPEED_MIN_KPH}
              max={SPEED_MAX_KPH}
              step={SPEED_STEP_KPH}
              value={[form.maxSpeedKph]}
              onValueChange={(values) => handleMaxSpeedChange(values[0] ?? 0)}
              aria-label="Truck maximum speed"
            />
          </div>

          {errorMessage ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setForm(initialFormState())}
              disabled={isSubmitting}
            >
              Reset
            </Button>
            <Button
              type="submit"
              size="sm"
              className="px-4"
              disabled={!canCreate || isSubmitting}
              aria-busy={isSubmitting}
            >
              Create Truck
            </Button>
          </div>
        </form>
      </section>

      <section className="flex min-h-0 flex-1 flex-col rounded-lg border border-black/10 bg-white/70 shadow-sm">
        <header className="flex items-center justify-between border-b border-black/10 px-3 py-2">
          <div>
            <h3 className="text-xs font-semibold tracking-wide text-black/70 uppercase">
              Fleet manifest
            </h3>
            <p className="text-[11px] text-black/50">
              Latest trucks from <code>agent.created</code> signals.
            </p>
          </div>
          <Badge variant="outline" className="text-[11px] text-black/70">
            {fleetCountLabel}
          </Badge>
        </header>

        <ScrollArea className="min-h-0 w-full flex-1">
          {createdTrucks.length === 0 ? (
            <div className="flex h-full items-center justify-center px-3 py-6 text-xs text-black/50">
              No trucks have been created yet.
            </div>
          ) : (
            <div className="space-y-2 px-3 py-3">
              {createdTrucks.map((truck) => {
                const isHighlighted = truck.id === highlightId;
                return (
                  <article
                    key={truck.id}
                    className={cn(
                      'rounded-md border border-black/10 bg-white/90 p-3 shadow-sm transition-colors',
                      isHighlighted &&
                        'border-orange-300/80 bg-orange-50/70 shadow-md',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-black/80">
                        {truck.id}
                      </h4>
                      <span className="text-xs text-black/60">
                        {truck.current_speed_kph.toFixed(1)} /{' '}
                        {truck.max_speed_kph.toFixed(1)} km/h
                      </span>
                    </div>
                    <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-black/60">
                      <div>
                        <dt className="font-semibold text-black/70">
                          Current node
                        </dt>
                        <dd>{formatGraphIndex(truck.current_node)}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-black/70">
                          Current edge
                        </dt>
                        <dd>{formatGraphIndex(truck.current_edge)}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-black/70">
                          Destination
                        </dt>
                        <dd>{formatGraphIndex(truck.destination)}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold text-black/70">
                          Route length
                        </dt>
                        <dd>{truck.route.length}</dd>
                      </div>
                    </dl>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-black/50">
                      <span>Inbox: {truck.inbox_count}</span>
                      <span>Outbox: {truck.outbox_count}</span>
                      <span>
                        Progress: {truck.edge_progress_m.toFixed(1)} m
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </section>
    </HudContainer>
  );
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

type GraphIndexLike =
  | TruckCreatedEnvelope['current_node']
  | TruckCreatedEnvelope['current_edge']
  | TruckCreatedEnvelope['destination'];

function formatGraphIndex(value: GraphIndexLike): string {
  if (value === null || value === undefined) return '—';
  return String(value);
}

function createTruckId(): string {
  try {
    if (
      typeof crypto !== 'undefined' &&
      typeof crypto.randomUUID === 'function'
    ) {
      return crypto.randomUUID();
    }
  } catch {
    // ignore platform-specific crypto issues
  }
  return fallbackUuid();
}

function fallbackUuid(): string {
  // 36-char UUID v4 template
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const rand = (Math.random() * 16) | 0;
    const value = char === 'x' ? rand : (rand & 0x3) | 0x8;
    return value.toString(16);
  });
}
