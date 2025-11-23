import type { WebSocketClient } from '@/net';
import type { SimStore } from '../store/sim-store';
import { mapNetEvent } from './net-adapter';

function nowMs(): number {
  // Prefer monotonic timer for interpolation alignment
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return typeof performance !== 'undefined' &&
    typeof performance.now === 'function'
    ? performance.now()
    : Date.now();
}

/**
 * Subscribes to network signals and forwards them to the simulation store.
 * Returns an unsubscribe function to detach all handlers.
 */
export function wireNetToSim(
  net: WebSocketClient,
  store: SimStore,
): () => void {
  const off: Array<() => void> = [];

  off.push(
    net.on('tick.start', (data) => {
      store.ingest({ type: 'tick.start', tick: data.tick, timeMs: nowMs() });
    }),
  );

  off.push(
    net.on('tick.end', (data) => {
      store.ingest({ type: 'tick.end', tick: data.tick, timeMs: nowMs() });
    }),
  );

  const forward = (signal: string, data: unknown) => {
    const evt = mapNetEvent({ signal, data });
    if (evt) store.ingest(evt);
  };

  off.push(net.on('map.created', (data) => forward('map.created', data)));

  off.push(net.on('agent.created', (data) => forward('agent.created', data)));
  off.push(net.on('agent.updated', (data) => forward('agent.updated', data)));
  off.push(net.on('agent.deleted', (data) => forward('agent.deleted', data)));

  off.push(
    net.on('simulation.started', (data) => forward('simulation.started', data)),
  );
  off.push(
    net.on('simulation.updated', (data) => forward('simulation.updated', data)),
  );

  return () => {
    for (const fn of off) fn();
  };
}
