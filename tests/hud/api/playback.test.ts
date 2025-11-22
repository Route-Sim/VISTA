import { describe, it, expect } from 'vitest';
import type {
  PlaybackCommand,
  PlaybackState,
  PlaybackStatus,
} from '@/hud/api/playback';

// Type-only test to ensure exported types are valid and importable
describe('HUD API Types', () => {
  it('should allow valid commands', () => {
    const cmd1: PlaybackCommand = { type: 'play' };
    const cmd2: PlaybackCommand = { type: 'setTickRate', hz: 60 };

    expect(cmd1.type).toBe('play');
    expect(cmd2.type).toBe('setTickRate');
    if (cmd2.type === 'setTickRate') {
      expect(cmd2.hz).toBe(60);
    }
  });

  it('should allow valid states', () => {
    const state: PlaybackState = {
      status: 'playing',
      tickRateHz: 30,
    };
    const status: PlaybackStatus = 'paused';

    expect(state.status).toBe('playing');
    expect(status).toBe('paused');
  });
});
