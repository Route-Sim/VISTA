import * as React from 'react';
import { HudContainer } from '@/hud/components/hud-container';
import { cn } from '../lib/utils';

export function FleetCreator({
  className,
}: {
  className?: string;
}): React.ReactNode {
  return (
    <HudContainer
      id="fleet-creator"
      title="Fleet Creator"
      description="Create a fleet of vehicles to be used in the simulation."
      closable={false}
      className={cn('flex h-full flex-col', className)}
    >
      <div className="flex flex-1 items-center justify-center text-sm text-black/70">
        {/* Content will be added later */}
      </div>
    </HudContainer>
  );
}
