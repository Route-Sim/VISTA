import * as React from 'react';
import { HudContainer } from '@/hud/components/hud-container';
import { cn } from '../lib/utils';

export function MapCreator({
  className,
}: {
  className?: string;
}): React.ReactNode {
  return (
    <HudContainer
      id="map-creator"
      title="Map Creator"
      description="Set parameters for the logistics network map generator to generate and view the map."
      closable={false}
      className={cn('flex h-full flex-col', className)}
    >
      <div className="flex flex-1 items-center justify-center text-sm text-black/70">
        {/* Content will be added later */}
      </div>
    </HudContainer>
  );
}
