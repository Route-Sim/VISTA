import { describe, it, expect, vi } from 'vitest';
import { InstrumentedTransport } from '@/net/transport/instrumented-transport';
import type { IWebSocketTransport, ReadyState } from '@/net/transport/browser-websocket';

class MockTransport implements IWebSocketTransport {
  readyState: ReadyState = 'idle';
  sent: string[] = [];
  
  connect = vi.fn();
  disconnect = vi.fn();
  send = vi.fn();
  onOpen = vi.fn(() => () => {});
  onClose = vi.fn(() => () => {});
  onError = vi.fn(() => () => {});
  onMessage = vi.fn(() => () => {});
}

describe('InstrumentedTransport', () => {
  it('should delegate standard methods to inner transport', () => {
    const inner = new MockTransport();
    const transport = new InstrumentedTransport(inner);

    transport.connect();
    expect(inner.connect).toHaveBeenCalled();

    transport.disconnect(1000, 'reason');
    expect(inner.disconnect).toHaveBeenCalledWith(1000, 'reason');

    transport.send('data');
    expect(inner.send).toHaveBeenCalledWith('data');

    const cb = () => {};
    transport.onOpen(cb);
    expect(inner.onOpen).toHaveBeenCalledWith(cb);
  });

  it('should emit onConnecting when connect is called', () => {
    const inner = new MockTransport();
    const transport = new InstrumentedTransport(inner);
    const handler = vi.fn();

    transport.onConnecting(handler);
    transport.connect();

    expect(handler).toHaveBeenCalled();
    expect(inner.connect).toHaveBeenCalled();
  });

  it('should emit onOutgoing when send is called', () => {
    const inner = new MockTransport();
    const transport = new InstrumentedTransport(inner);
    const handler = vi.fn();

    transport.onOutgoing(handler);
    transport.send('payload');

    expect(handler).toHaveBeenCalledWith('payload');
    expect(inner.send).toHaveBeenCalledWith('payload');
  });

  it('should expose inner readyState', () => {
    const inner = new MockTransport();
    const transport = new InstrumentedTransport(inner);

    inner.readyState = 'open';
    expect(transport.readyState).toBe('open');

    inner.readyState = 'closed';
    expect(transport.readyState).toBe('closed');
  });
});

