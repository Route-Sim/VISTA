import type { ReactNode } from 'react';
import { CardHeader, CardTitle, CardFooter } from '@/hud/ui/card';
import { Button } from '@/hud/ui/button';
import { type LucideIcon, X } from 'lucide-react';

export function KeyValue({
  label,
  value,
  unit,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-black/60">{label}</span>
      <span className="font-medium text-black/90">
        {value}
        {unit && <span className="ml-1 text-xs text-black/50">{unit}</span>}
      </span>
    </div>
  );
}

export function InspectorHeader({
  icon: Icon,
  title,
  id,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  id: string;
  subtitle?: string;
}) {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
      <div className="flex min-w-0 items-center gap-2">
        <div className="rounded-md bg-black/5 p-1.5">
          <Icon className="h-4 w-4 text-black/70" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <CardTitle className="truncate text-sm font-semibold text-black/90">
              {title}
            </CardTitle>
            {subtitle && (
              <span className="text-xs text-black/50">{subtitle}</span>
            )}
          </div>
          <div className="truncate font-mono text-[10px] text-black/50">
            {id}
          </div>
        </div>
      </div>
    </CardHeader>
  );
}

export function SectionHeader({ title }: { title: string }) {
  return (
    <div className="bg-black/[0.02] px-3 py-1.5 text-xs font-medium tracking-wider text-black/40 uppercase">
      {title}
    </div>
  );
}

export function InspectorFooter({ onClose }: { onClose: () => void }) {
  return (
    <CardFooter className="mt-4 px-2 py-2">
      <Button variant="outline" size="lg" onClick={onClose} className="w-full">
        <X className="h-4 w-4" />
        Return to the default view
      </Button>
    </CardFooter>
  );
}
