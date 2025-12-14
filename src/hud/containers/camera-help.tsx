import * as React from 'react';

import { HudContainer } from '@/hud/components/hud-container';
import { KeyCap } from '@/hud/components/key-cap';

export function CameraHelp(): React.ReactNode {
  return (
    <HudContainer id="camera-help" title="Camera & Movement" className="w-96">
      <div className="flex flex-col gap-2 py-4">
        <div className="space-y-1.5 text-[12px]">
          <div className="flex items-center gap-2">
            <KeyCap>W</KeyCap> / <KeyCap>S</KeyCap>
            <span className="text-black/80">Move Forward/Backward</span>
          </div>
          <div className="flex items-center gap-2">
            <KeyCap>A</KeyCap> / <KeyCap>D</KeyCap>
            <span className="text-black/80">Move Left/Right</span>
          </div>
          <div className="flex items-center gap-2">
            <KeyCap>Space</KeyCap> / <KeyCap>Shift</KeyCap>
            <span className="text-black/80">Move Up/Down</span>
          </div>
          <div className="flex items-center gap-2">
            <KeyCap>Left Mouse</KeyCap>
            <span className="text-black/80">Orbit</span>
          </div>
          <div className="flex items-center gap-2">
            <KeyCap>Right Mouse</KeyCap> / <KeyCap>Middle</KeyCap>
            <span className="text-black/80">Pan</span>
          </div>
          <div className="flex items-center gap-2">
            <KeyCap>Scroll</KeyCap>
            <span className="text-black/80">Zoom</span>
          </div>
        </div>
      </div>
    </HudContainer>
  );
}
