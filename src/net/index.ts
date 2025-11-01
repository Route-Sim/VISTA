export type {
  ActionName,
  ActionParams,
  ActionEnvelopeOf,
  SignalName,
  SignalData,
  SignalEnvelopeOf,
  SignalUnion,
} from '@/net/protocol/schema';

export {
  ActionSchemas,
  SignalSchemas,
  decodeSignal,
  decodeAction,
  encodeAction,
} from '@/net/protocol/schema';

export type { ExpectedSignalByAction } from '@/net/protocol/mapping';
export { ActionToSignal, getDefaultMatcher } from '@/net/protocol/mapping';

export type { BackoffStrategy, ExponentialBackoffOptions } from '@/net/backoff';
export { ExponentialBackoff } from '@/net/backoff';

export type {
  IWebSocketTransport,
  ReadyState,
  CloseEventLike,
} from '@/net/transport/browser-websocket';
export { BrowserWebSocketTransport } from '@/net/transport/browser-websocket';

export { WebSocketClient } from '@/net/client';

import { wsUrl } from '@/app/config';
import { ExponentialBackoff } from '@/net/backoff';
import { BrowserWebSocketTransport } from '@/net/transport/browser-websocket';
import { WebSocketClient } from '@/net/client';
import { InstrumentedTransport } from '@/net/transport/instrumented-transport';
import { wireNetTelemetry } from '@/net/telemetry';

const rawTransport = new BrowserWebSocketTransport({
  url: wsUrl,
  backoff: new ExponentialBackoff({
    initialDelayMs: 500,
    factor: 2,
    maxDelayMs: 30_000,
    jitterRatio: 0.2,
  }),
});

const transport = new InstrumentedTransport(rawTransport);
export const net = new WebSocketClient(transport, 10_000);
wireNetTelemetry(net, transport);
// Consumers should call: net.connect()
