import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePlaybackNetController } from '@/hud/hooks/use-playback-controller';
import { net } from '@/net';

// Mock the net singleton
vi.mock('@/net', () => ({
  net: {
    connect: vi.fn(),
    sendAction: vi.fn(),
  },
}));

describe('usePlaybackNetController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should connect on mount', () => {
    renderHook(() => usePlaybackNetController());
    expect(net.connect).toHaveBeenCalled();
  });

  it('should send tick_rate.update on setTickRate', async () => {
    const { result } = renderHook(() => usePlaybackNetController());
    
    await result.current.commandSink({ type: 'setTickRate', hz: 120 });
    expect(net.sendAction).toHaveBeenCalledWith('tick_rate.update', { tick_rate: 120 });
  });

  it('should send simulation.start with cached tick rate on play', async () => {
    const { result } = renderHook(() => usePlaybackNetController());

    // Set rate first
    await result.current.commandSink({ type: 'setTickRate', hz: 30 });
    
    // Play
    await result.current.commandSink({ type: 'play' });
    expect(net.sendAction).toHaveBeenCalledWith('simulation.start', { tick_rate: 30 });
  });

  it('should default tick rate to 60 if local storage missing', async () => {
    const { result } = renderHook(() => usePlaybackNetController());
    
    await result.current.commandSink({ type: 'play' });
    expect(net.sendAction).toHaveBeenCalledWith('simulation.start', { tick_rate: 60 });
  });

  it('should send resume command', async () => {
    const { result } = renderHook(() => usePlaybackNetController());
    await result.current.commandSink({ type: 'resume' });
    expect(net.sendAction).toHaveBeenCalledWith('simulation.resume', {});
  });

  it('should send pause command', async () => {
    const { result } = renderHook(() => usePlaybackNetController());
    await result.current.commandSink({ type: 'pause' });
    expect(net.sendAction).toHaveBeenCalledWith('simulation.pause', {});
  });

  it('should send stop command', async () => {
    const { result } = renderHook(() => usePlaybackNetController());
    await result.current.commandSink({ type: 'stop' });
    expect(net.sendAction).toHaveBeenCalledWith('simulation.stop', {});
  });
});

