import { createRoot } from "react-dom/client";
import { HudFrame } from "./components/hud-frame";

export type HudHandle = {
  element: HTMLDivElement;
  show(): void;
  hide(): void;
  toggle(): void;
  destroy(): void;
};

function HudRoot() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      <HudFrame />
    </div>
  );
}

export function mountHud(root: HTMLElement = document.body): HudHandle {
  const container = document.createElement("div");
  root.appendChild(container);
  const reactRoot = createRoot(container);
  reactRoot.render(<HudRoot />);

  const handle: HudHandle = {
    element: container,
    show() {
      container.style.display = "block";
    },
    hide() {
      container.style.display = "none";
    },
    toggle() {
      container.style.display =
        container.style.display === "none" ? "block" : "none";
    },
    destroy() {
      reactRoot.unmount();
      container.remove();
    },
  };

  return handle;
}
