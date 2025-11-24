import { TreeDeciduous } from 'lucide-react';
import { CardContent } from '@/hud/ui/card';
import { Separator } from '@/hud/ui/separator';
import { InspectorHeader, SectionHeader } from './common';

export function TreeInspector() {
  return (
    <>
      <InspectorHeader
        icon={TreeDeciduous}
        title="Vegetation"
        id="visual-prop"
      />
      <Separator />
      <SectionHeader title="Info" />
      <CardContent className="p-3 pt-2">
        <div className="text-sm text-black/60 italic">
          Just a tree. Standing here and there. Does nothing. Do not touch it.
        </div>
      </CardContent>
    </>
  );
}
