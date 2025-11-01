import * as React from 'react';

import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/hud/ui/card';
import { Button } from '@/hud/ui/button';
import { cn } from '@/hud/lib/utils';
import { useHudVisibility } from '@/hud/state/hud-visibility';
import type { HudPanelId } from '@/hud/state/hud-visibility';

export type HudContainerProps = {
  id: HudPanelId;
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
  closable?: boolean;
};

export function HudContainer({
  id,
  title,
  description,
  className,
  children,
  closable = true,
}: HudContainerProps): React.ReactNode | null {
  const { isVisible, setVisible } = useHudVisibility();
  const visible = isVisible(id);
  if (!visible) return null;

  const needsFlex = className?.includes('flex') || className?.includes('h-full');
  const cardClassName = needsFlex 
    ? 'rounded-xl border border-black/10 bg-white/90 shadow-lg backdrop-blur-sm h-full flex flex-col'
    : 'rounded-xl border border-black/10 bg-white/90 shadow-lg backdrop-blur-sm';

  return (
    <div className={cn('pointer-events-auto', className)}>
      <Card className={cardClassName}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
          <div className="min-w-0">
            <CardTitle className="truncate text-sm font-semibold text-black/90">
              {title}
            </CardTitle>
            {description ? (
              <div className="mt-0.5 text-xs text-black/60">{description}</div>
            ) : null}
          </div>
          {closable ? (
            <Button
              aria-label={`Hide ${title}`}
              title="Hide"
              size="icon"
              variant="ghost"
              onClick={() => setVisible(id, false)}
              className="text-black/70 hover:text-black"
            >
              <X />
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className={cn('p-3 pt-0', needsFlex && 'flex-1 min-h-0 flex flex-col')}>{children}</CardContent>
      </Card>
    </div>
  );
}
