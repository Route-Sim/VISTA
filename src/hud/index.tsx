import * as React from 'react';
import { createRoot } from 'react-dom/client';
import {
  HudVisibilityProvider,
  useHudVisibility,
} from './state/hud-visibility';
import {
  PlaybackStateProvider,
  usePlaybackState,
} from './state/playback-state';
import { PlayControls } from './containers/play-controls';
import { CameraHelp } from './containers/camera-help';
import { HudMenu } from './components/hud-menu';
import { usePlaybackNetController } from './hooks/use-playback-controller';
import { useHudHotkeys } from './hooks/use-hud-hotkeys';
import { NetEventsPanel } from './containers/net-events';
import { MapCreator } from './containers/map-creator';
import { FleetCreator } from './containers/fleet-creator';
import { StartSimulation } from './containers/start-simulation';

export type HudHandle = {
  element: HTMLDivElement;
  show(): void;
  hide(): void;
  toggle(): void;
  destroy(): void;
};

function HudHotkeysMount() {
  useHudHotkeys();
  return null;
}

function HudRoot() {
  const playbackController = usePlaybackNetController();
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      <PlaybackStateProvider>
        <HudVisibilityProvider>
          <HudHotkeysMount />
          <PlaybackVisibilityManager />
          <CreatorPanels controller={playbackController} />
          <SimulationPanels controller={playbackController} />
        </HudVisibilityProvider>
      </PlaybackStateProvider>
    </div>
  );
}

function PlaybackVisibilityManager() {
  const { status } = usePlaybackState();
  const { setVisible } = useHudVisibility();

  // Hide all panels except Map/Fleet Creator/Start Simulation when simulation hasn't started (idle/stopped)
  // Show them when simulation is playing or paused
  React.useEffect(() => {
    const isSimulationActive = status === 'playing' || status === 'paused';
    setVisible('play-controls', isSimulationActive);
    setVisible('camera-help', isSimulationActive);
    setVisible('net-events', isSimulationActive);
    setVisible('start-simulation', !isSimulationActive);
  }, [status, setVisible]);

  return null;
}

function SimulationPanels({
  controller,
}: {
  controller?: ReturnType<typeof usePlaybackNetController>;
}) {
  const { status } = usePlaybackState();
  const { isVisible } = useHudVisibility();

  // Only render simulation panels when simulation is active
  if (status === 'idle' || status === 'stopped') return null;

  return (
    <>
      <div className="fixed top-4 bottom-4 left-4 flex flex-col gap-4">
        {isVisible('play-controls') && <PlayControls controller={controller} />}
        {isVisible('camera-help') && <CameraHelp />}
        {isVisible('net-events') && (
          <div className="min-h-0 flex-1">
            <NetEventsPanel />
          </div>
        )}
      </div>

      <div className="fixed right-4 bottom-4">
        <HudMenu />
      </div>
    </>
  );
}

function CreatorPanels({
  controller,
}: {
  controller?: ReturnType<typeof usePlaybackNetController>;
}): React.ReactNode {
  const { status } = usePlaybackState();
  const { setVisible } = useHudVisibility();

  // Hide creator panels when simulation starts (playing or paused)
  React.useEffect(() => {
    if (status === 'playing' || status === 'paused') {
      setVisible('map-creator', false);
      setVisible('fleet-creator', false);
      setVisible('start-simulation', false);
    }
  }, [status, setVisible]);

  // Show creator panels when simulation stops/returns to idle
  React.useEffect(() => {
    if (status === 'idle' || status === 'stopped') {
      setVisible('map-creator', true);
      setVisible('fleet-creator', true);
      setVisible('start-simulation', true);
    }
  }, [status, setVisible]);

  // Only render creator panels when idle or stopped
  if (status === 'playing' || status === 'paused') return null;

  return (
    <div className="fixed inset-0 grid grid-cols-2 grid-rows-[1fr_auto] gap-4 bg-[#0d1f2d] p-4">
      <MapCreator className="row-span-2" />
      <FleetCreator />
      <StartSimulation controller={controller} />
    </div>
  );
}

export function mountHud(root: HTMLElement = document.body): HudHandle {
  const container = document.createElement('div');
  root.appendChild(container);
  const reactRoot = createRoot(container);
  reactRoot.render(<HudRoot />);

  const handle: HudHandle = {
    element: container,
    show() {
      container.style.display = 'block';
    },
    hide() {
      container.style.display = 'none';
    },
    toggle() {
      container.style.display =
        container.style.display === 'none' ? 'block' : 'none';
    },
    destroy() {
      reactRoot.unmount();
      container.remove();
    },
  };

  return handle;
}
