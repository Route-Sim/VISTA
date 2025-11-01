export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'stopped';

export type PlaybackCommand =
  | { type: 'play' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'stop' }
  | { type: 'setTickRate'; hz: number };

export type PlaybackState = {
  status: PlaybackStatus;
  tickRateHz: number;
};

export interface PlaybackController {
  initialState?: PlaybackState;
  commandSink?: (cmd: PlaybackCommand) => void; // to be provided by @net layer later
}
