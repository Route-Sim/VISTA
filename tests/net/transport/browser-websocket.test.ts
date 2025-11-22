import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserWebSocketTransport } from '@/net/transport/browser-websocket';
import { ExponentialBackoff } from '@/net/backoff';

// Mock global WebSocket
class MockWebSocket {
  onopen: (() => void) | null = null;
  onclose: ((ev: CloseEvent) => void) | null = null;
  onerror: ((ev: Event) => void) | null = null;
  onmessage: ((ev: MessageEvent) => void) | null = null;
  
  send = vi.fn();
  close = vi.fn();

  constructor(public url: string) {}
}

describe('BrowserWebSocketTransport', () => {
  let backoff: ExponentialBackoff;
  let transport: BrowserWebSocketTransport;

  beforeEach(() => {
    vi.useFakeTimers();
    // Reset mocks
    vi.stubGlobal('WebSocket', MockWebSocket);
    backoff = new ExponentialBackoff({ initialDelayMs: 100 });
    transport = new BrowserWebSocketTransport({
      url: 'ws://test.local',
      backoff,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('should connect and set readyState', () => {
    transport.connect();
    expect(transport.readyState).toBe('connecting');
    
    // Simulate open
    // @ts-expect-error - accessing private field for test
    const ws = transport.ws as MockWebSocket;
    expect(ws).toBeDefined();
    ws.onopen?.();

    expect(transport.readyState).toBe('open');
  });

  it('should reconnect on close', () => {
    transport.connect();
    // @ts-expect-error - private
    const ws = transport.ws as MockWebSocket;
    ws.onopen?.();

    // Simulate unexpected close
    ws.onclose?.({ code: 1006, reason: 'Err', wasClean: false } as CloseEvent);
    expect(transport.readyState).toBe('closed');

    // Should schedule reconnect
    // Note: The implementation schedules with setTimeout, so we need to advance timers
    // effectively to trigger the callback.
    // The delay is 100ms.
    vi.advanceTimersByTime(150); // slightly more than 100 to be safe
    
    // Should have created a new WS
    // @ts-expect-error - private
    expect(transport.ws).not.toBe(ws); // New instance
    expect(transport.readyState).toBe('connecting');
  });

  it('should not reconnect after explicit disconnect', () => {
    transport.connect();
    // @ts-expect-error - private
    const ws = transport.ws as MockWebSocket;
    ws.onopen?.();

    transport.disconnect();
    expect(transport.readyState).toBe('closing');
    
    // Simulate close response
    ws.onclose?.({ code: 1000, reason: 'Normal', wasClean: true } as CloseEvent);
    expect(transport.readyState).toBe('closed');

    vi.advanceTimersByTime(10000);
    // Should still be closed, no new connection
    expect(transport.readyState).toBe('closed');
  });

  it('should emit messages', () => {
    const handler = vi.fn();
    transport.onMessage(handler);
    transport.connect();
    // @ts-expect-error - private
    const ws = transport.ws as MockWebSocket;
    ws.onopen?.();

    ws.onmessage?.({ data: 'hello' } as MessageEvent);
    expect(handler).toHaveBeenCalledWith('hello');
  });
});

