export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'stopped';

export type PlaybackCommand =
  | { type: 'play' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'stop' }
  | { type: 'update'; tickRate: number; speed: number };

export type PlaybackState = {
  status: PlaybackStatus;
  tickRate: number;
  speed: number;
};

export interface PlaybackController {
  initialState?: PlaybackState;
  commandSink?: (cmd: PlaybackCommand) => void; // to be provided by @net layer later
}
