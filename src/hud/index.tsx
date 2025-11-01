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
        
        <div className="fixed left-4 top-4 bottom-4 flex flex-col gap-4">
          <PlayControls controller={playbackController} />
          <CameraHelp />
          <div className="flex-1 min-h-0">
            <NetEventsPanel />
          </div>
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
