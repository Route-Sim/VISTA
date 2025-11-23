import { MapPin } from 'lucide-react';
import { CardContent } from '@/hud/ui/card';
import { Separator } from '@/hud/ui/separator';
import { KeyValue, InspectorHeader, SectionHeader } from './common';
import type { Node } from '@/sim/domain/entities';

interface NodeInspectorProps {
  id: string;
  data: Node;
}

export function NodeInspector({ id, data }: NodeInspectorProps) {
  return (
    <>
      <InspectorHeader icon={MapPin} title="Intersection Node" id={id} />
      <Separator />

      <SectionHeader title="Location" />
      <CardContent className="space-y-2 p-3 pt-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col items-center rounded bg-black/5 p-2">
            <span className="text-[10px] text-black/40 uppercase">X Coord</span>
            <span className="font-mono text-sm">{Math.round(data.x)}</span>
          </div>
          <div className="flex flex-col items-center rounded bg-black/5 p-2">
            <span className="text-[10px] text-black/40 uppercase">Y Coord</span>
            <span className="font-mono text-sm">{Math.round(data.y)}</span>
          </div>
        </div>
      </CardContent>

      <Separator />
      <SectionHeader title="Connections" />
      <CardContent className="space-y-2 p-3 pt-2">
        <KeyValue
          label="Connected Buildings"
          value={data.buildingIds.length}
          unit="structures"
        />
      </CardContent>
    </>
  );
}
