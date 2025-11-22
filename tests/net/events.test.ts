import { describe, it, expect, vi } from 'vitest';
import { EventBus } from '@/net/events';

type TestEvents = {
  'user.login': { id: string };
  'user.logout': void;
};

describe('EventBus', () => {
  it('should emit and receive events', () => {
    const bus = new EventBus<TestEvents>();
    const handler = vi.fn();

    bus.on('user.login', handler);
    bus.emit('user.login', { id: '123' });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ id: '123' });
  });

  it('should unsubscribe handlers', () => {
    const bus = new EventBus<TestEvents>();
    const handler = vi.fn();

    const off = bus.on('user.login', handler);
    bus.emit('user.login', { id: '1' });
    expect(handler).toHaveBeenCalledTimes(1);

    off();
    bus.emit('user.login', { id: '2' });
    expect(handler).toHaveBeenCalledTimes(1); // no new calls
  });

  it('should handle multiple handlers for same event', () => {
    const bus = new EventBus<TestEvents>();
    const h1 = vi.fn();
    const h2 = vi.fn();

    bus.on('user.login', h1);
    bus.on('user.login', h2);
    bus.emit('user.login', { id: 'abc' });

    expect(h1).toHaveBeenCalled();
    expect(h2).toHaveBeenCalled();
  });

  it('should handle once() correctly', () => {
    const bus = new EventBus<TestEvents>();
    const handler = vi.fn();

    bus.once('user.logout', handler);
    bus.emit('user.logout', undefined);
    bus.emit('user.logout', undefined);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should isolate different events', () => {
    const bus = new EventBus<TestEvents>();
    const loginHandler = vi.fn();
    const logoutHandler = vi.fn();

    bus.on('user.login', loginHandler);
    bus.on('user.logout', logoutHandler);

    bus.emit('user.login', { id: 'x' });

    expect(loginHandler).toHaveBeenCalled();
    expect(logoutHandler).not.toHaveBeenCalled();
  });
});
