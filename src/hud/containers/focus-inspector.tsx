import { useFocusState } from '@/hud/state/focus-state';
import { useSelectedObject } from '@/hud/hooks/use-selected-object';
import { Card, CardContent } from '@/hud/ui/card';
import { Separator } from '@/hud/ui/separator';
import { MapPin } from 'lucide-react';

// Import subcomponents
import { AgentInspector } from '@/hud/components/inspector/agent-inspector';
import { RoadInspector } from '@/hud/components/inspector/road-inspector';
import { NodeInspector } from '@/hud/components/inspector/node-inspector';
import {
  ParkingInspector,
  SiteInspector,
} from '@/hud/components/inspector/building-inspector';
import { GasStationInspector } from '@/hud/components/inspector/gas-station-inspector';
import { TreeInspector } from '@/hud/components/inspector/tree-inspector';
import {
  InspectorFooter,
  InspectorHeader,
} from '@/hud/components/inspector/common';

export function FocusInspector() {
  const { clearFocus } = useFocusState();
  const { id, type, object } = useSelectedObject();

  if (!id || !type) return null;

  return (
    <div className="pointer-events-auto w-96 rounded-xl h-full">
      <Card className="overflow-y-auto rounded-xl border border-black/10 bg-white/90 shadow-lg backdrop-blur-sm max-h-full">
        {object?.kind === 'agent' && (
          <AgentInspector id={id} data={object.data} />
        )}

        {object?.kind === 'road' && (
          <RoadInspector id={id} data={object.data} />
        )}

        {object?.kind === 'node' && (
          <NodeInspector id={id} data={object.data} />
        )}

        {object?.kind === 'site' && (
          <SiteInspector id={id} data={object.data} />
        )}

        {object?.kind === 'parking' && (
          <ParkingInspector id={id} data={object.data} />
        )}

        {object?.kind === 'gas_station' && (
          <GasStationInspector id={id} data={object.data} />
        )}

        {object?.kind === 'tree' && <TreeInspector />}

        {!object && (
          <>
            <InspectorHeader icon={MapPin} title="Unknown Object" id={id} />
            <Separator />
            <CardContent className="p-3">
              <div className="text-sm text-black/60 italic">
                Object data not found in simulation.
              </div>
            </CardContent>
          </>
        )}

        <InspectorFooter onClose={clearFocus} />
      </Card>
    </div>
  );
}
