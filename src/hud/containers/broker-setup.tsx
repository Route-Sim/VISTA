import * as React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { HudContainer } from '@/hud/components/hud-container';
import { Button } from '@/hud/ui/button';
import { Input } from '@/hud/ui/input';
import { Label } from '@/hud/ui/label';
import { Badge } from '@/hud/ui/badge';
import { cn } from '../lib/utils';
import { net, type ActionParams, type SignalData } from '@/net';
import { usePlaybackState } from '@/hud/state/playback-state';

// Balance constraints
const BALANCE_MIN = 0;
const DEFAULT_BALANCE_DUCATS = 10000;
const DEFAULT_BROKER_ID = 'broker-main';

type BrokerData = Extract<SignalData['agent.created'], { kind: 'broker' }>;
type BrokerCreateParams = ActionParams['agent.create'];
type BrokerUpdateParams = ActionParams['agent.update'];

type BrokerFormState = {
  agentId: string;
  balanceDucats: number;
};

export function BrokerSetup({
  className,
}: {
  className?: string;
}): React.ReactNode {
  const { status } = usePlaybackState();
  const canModify = status === 'idle' || status === 'stopped';

  const [form, setForm] = React.useState<BrokerFormState>({
    agentId: DEFAULT_BROKER_ID,
    balanceDucats: DEFAULT_BALANCE_DUCATS,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null,
  );
  const [existingBroker, setExistingBroker] = React.useState<BrokerData | null>(
    null,
  );

  // Subscribe to broker signals
  React.useEffect(() => {
    // Listen for agent list to find existing broker
    const unsubscribeListed = net.on('agent.listed', (data) => {
      const broker = data.agents.find(
        (agent) => agent.kind === 'broker',
      ) as BrokerData | undefined;
      if (broker) {
        setExistingBroker(broker);
        setForm({
          agentId: broker.id,
          balanceDucats: broker.balance_ducats ?? DEFAULT_BALANCE_DUCATS,
        });
      }
    });

    // Listen for broker creation
    const unsubscribeCreated = net.on('agent.created', (data) => {
      if (data.kind !== 'broker') return;
      setExistingBroker(data);
      setForm({
        agentId: data.id,
        balanceDucats: data.balance_ducats ?? DEFAULT_BALANCE_DUCATS,
      });
    });

    // Listen for broker updates
    const unsubscribeUpdated = net.on('agent.updated', (data) => {
      if (existingBroker && data.agent_id === existingBroker.id) {
        // Refresh broker data - the update signal may contain partial data
        // For now, just update what we know
        setExistingBroker((prev) => (prev ? { ...prev, ...data } : prev));
      }
    });

    return () => {
      unsubscribeListed();
      unsubscribeCreated();
      unsubscribeUpdated();
    };
  }, [existingBroker]);

  const handleSubmit = React.useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

      if (!canModify) {
        setErrorMessage(
          'Simulation must be idle or stopped to modify the broker.',
        );
        return;
      }

      const clampedBalance = Math.max(BALANCE_MIN, form.balanceDucats);
      const agentId = form.agentId.trim() || DEFAULT_BROKER_ID;

      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      try {
        if (existingBroker) {
          // Update existing broker
          const params: BrokerUpdateParams = {
            agent_id: existingBroker.id,
            agent_data: {
              balance_ducats: clampedBalance,
            },
          };

          const response = await net.sendAction('agent.update', params);
          if (response.signal === 'error') {
            setErrorMessage(response.data.message);
            return;
          }
          setSuccessMessage('Broker updated successfully');
        } else {
          // Create new broker
          const params: BrokerCreateParams = {
            agent_id: agentId,
            agent_kind: 'broker',
            agent_data: {
              balance_ducats: clampedBalance,
            },
          };

          const response = await net.sendAction('agent.create', params);
          if (response.signal === 'error') {
            setErrorMessage(response.data.message);
            return;
          }
          setSuccessMessage('Broker created successfully');
        }

        // Clear success message after delay
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : 'Failed to save broker.',
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, canModify, existingBroker],
  );

  const handleReset = React.useCallback(() => {
    if (existingBroker) {
      setForm({
        agentId: existingBroker.id,
        balanceDucats: existingBroker.balance_ducats ?? DEFAULT_BALANCE_DUCATS,
      });
    } else {
      setForm({
        agentId: DEFAULT_BROKER_ID,
        balanceDucats: DEFAULT_BALANCE_DUCATS,
      });
    }
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [existingBroker]);

  const brokerExists = existingBroker !== null;

  return (
    <HudContainer
      id="broker-setup"
      title="Broker Setup"
      description="Configure the broker agent that manages orders and coordinates deliveries."
      closable={false}
      className={cn('flex h-full min-h-0 flex-col', className)}
    >
      <div className="flex flex-1 flex-col gap-4 py-3">
        {/* Status indicator */}
        <div className="flex items-center gap-2">
          {brokerExists ? (
            <>
              <Badge
                variant="outline"
                className="gap-1.5 border-green-200 bg-green-50 text-green-700"
              >
                <CheckCircle2 className="h-3 w-3" />
                Broker Active
              </Badge>
              <span className="text-xs text-black/50">ID: {existingBroker.id}</span>
            </>
          ) : (
            <Badge
              variant="outline"
              className="gap-1.5 border-amber-200 bg-amber-50 text-amber-700"
            >
              <AlertCircle className="h-3 w-3" />
              No Broker Configured
            </Badge>
          )}
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Only show ID field when creating new broker */}
          {!brokerExists && (
            <div className="space-y-2">
              <Label htmlFor="broker-id" className="text-xs text-black/70">
                Broker identifier
              </Label>
              <Input
                id="broker-id"
                value={form.agentId}
                placeholder={DEFAULT_BROKER_ID}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, agentId: e.target.value }))
                }
                autoComplete="off"
                className="h-9"
              />
              <p className="text-[11px] text-black/50">
                Unique identifier for the broker agent.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="broker-balance" className="text-xs text-black/70">
              Balance (ducats)
            </Label>
            <Input
              id="broker-balance"
              type="number"
              min={BALANCE_MIN}
              value={form.balanceDucats}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  balanceDucats: Math.max(
                    BALANCE_MIN,
                    Number(e.target.value) || 0,
                  ),
                }))
              }
              className="h-9"
            />
            <p className="text-[11px] text-black/50">
              Funds available for the broker to manage orders and payments.
            </p>
          </div>

          {/* Messages */}
          {errorMessage && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {errorMessage}
            </p>
          )}
          {successMessage && (
            <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
              {successMessage}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Reset
            </Button>
            <Button
              type="submit"
              size="sm"
              className="px-6"
              disabled={!canModify || isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting
                ? 'Saving...'
                : brokerExists
                  ? 'Update Broker'
                  : 'Create Broker'}
            </Button>
          </div>
        </form>

        {/* Current broker info when exists */}
        {brokerExists && (
          <section className="mt-auto rounded-lg border border-black/10 bg-white/70 p-4">
            <h3 className="mb-3 text-xs font-semibold tracking-wide text-black/70 uppercase">
              Current Status
            </h3>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-black/50">Balance</dt>
                <dd className="font-medium text-black/80">
                  {existingBroker.balance_ducats?.toLocaleString() ?? '—'}{' '}
                  ducats
                </dd>
              </div>
              <div>
                <dt className="text-xs text-black/50">Inbox</dt>
                <dd className="font-medium text-black/80">
                  {existingBroker.inbox_count} messages
                </dd>
              </div>
              <div>
                <dt className="text-xs text-black/50">Outbox</dt>
                <dd className="font-medium text-black/80">
                  {existingBroker.outbox_count} messages
                </dd>
              </div>
            </dl>
          </section>
        )}
      </div>
    </HudContainer>
  );
}
