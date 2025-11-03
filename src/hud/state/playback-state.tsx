import * as React from 'react';
import type { PlaybackStatus } from '@/hud/api/playback';

type PlaybackStateContextValue = {
  status: PlaybackStatus;
  setStatus: (status: PlaybackStatus) => void;
};

const PlaybackStateContext =
  React.createContext<PlaybackStateContextValue | null>(null);

export function PlaybackStateProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const [status, setStatus] = React.useState<PlaybackStatus>('idle');

  const ctx: PlaybackStateContextValue = React.useMemo(
    () => ({ status, setStatus }),
    [status],
  );

  return (
    <PlaybackStateContext.Provider value={ctx}>
      {children}
    </PlaybackStateContext.Provider>
  );
}

export function usePlaybackState(): PlaybackStateContextValue {
  const ctx = React.useContext(PlaybackStateContext);
  if (!ctx)
    throw new Error('usePlaybackState must be used within PlaybackStateProvider');
  return ctx;
}

