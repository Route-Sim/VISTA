import { createRoot } from 'react-dom/client';
import { HudVisibilityProvider } from './state/hud-visibility';
import { PlayControls } from './containers/play-controls';
import { CameraHelp } from './containers/camera-help';
import { HudMenu } from './components/hud-menu';
import { usePlaybackNetController } from './hooks/use-playback-controller';
import { useHudHotkeys } from './hooks/use-hud-hotkeys';
import { NetEventsPanel } from './containers/net-events';

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
      <HudVisibilityProvider>
        <HudHotkeysMount />
        <NetEventsPanel />
        <div className="fixed top-4 right-4">
          <CameraHelp />
        </div>

        <div className="fixed bottom-4 left-1/2 -translate-x-1/2">
          <PlayControls controller={playbackController} />
        </div>

        <div className="fixed right-4 bottom-4">
          <HudMenu />
        </div>
      </HudVisibilityProvider>
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
