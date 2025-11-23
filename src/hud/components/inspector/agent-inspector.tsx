import { Car } from 'lucide-react';
import { useSimSnapshot } from '@/hud/hooks/use-sim-snapshot';
import { CardContent } from '@/hud/ui/card';
import { Separator } from '@/hud/ui/separator';
import { KeyValue, InspectorHeader, SectionHeader } from './common';
import type { Truck } from '@/sim/domain/entities';
import { getRoadById } from '@/sim/selectors';

interface AgentInspectorProps {
  id: string;
  data: Truck;
}

export function AgentInspector({ id, data }: AgentInspectorProps) {
  const snapshot = useSimSnapshot();
  const currentRoad = data.currentEdgeId
    ? getRoadById(snapshot, data.currentEdgeId)
    : undefined;
  const edgeLength = currentRoad?.lengthM ?? 1;
  const progressPercent = Math.round((data.edgeProgress / edgeLength) * 100);
  const fuelPercent = Math.round((data.currentFuel / data.maxFuel) * 100);
  const loadPercent = Math.round(
    (data.packageIds.length / data.capacity) * 100,
  );

  return (
    <>
      <InspectorHeader
        icon={Car}
        title="Delivery Truck"
        id={id}
        subtitle={data.currentSpeed > 0.1 ? 'Moving' : 'Idle'}
      />
      <Separator />

      <SectionHeader title="Status" />
      <CardContent className="space-y-2 p-3 pt-2">
        <KeyValue
          label="Speed"
          value={Math.round(data.currentSpeed)}
          unit={`/ ${data.maxSpeed} km/h`}
        />
        <div className="space-y-1">
          <KeyValue
            label="Fuel"
            value={`${Math.round(data.currentFuel)} L`}
            unit={`(${fuelPercent}%)`}
          />
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5">
            <div
              className="h-full bg-amber-500 transition-all duration-500"
              style={{ width: `${fuelPercent}%` }}
            />
          </div>
        </div>
        <KeyValue
          label="CO2 Emissions"
          value={data.co2Emission.toFixed(2)}
          unit="kg"
        />
      </CardContent>

      <Separator />
      <SectionHeader title="Logistics" />
      <CardContent className="space-y-2 p-3 pt-2">
        <div className="space-y-1">
          <KeyValue
            label="Cargo Load"
            value={`${data.packageIds.length}/${data.capacity}`}
            unit={`pkg (${loadPercent}%)`}
          />
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${loadPercent}%` }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="rounded bg-black/5 p-2 text-center">
            <div className="text-[10px] font-semibold text-black/40 uppercase">
              Inbox
            </div>
            <div className="font-medium text-black/90">{data.inboxCount}</div>
          </div>
          <div className="rounded bg-black/5 p-2 text-center">
            <div className="text-[10px] font-semibold text-black/40 uppercase">
              Outbox
            </div>
            <div className="font-medium text-black/90">{data.outboxCount}</div>
          </div>
        </div>
      </CardContent>

      <Separator />
      <SectionHeader title="Navigation" />
      <CardContent className="space-y-2 p-3 pt-2">
        <KeyValue
          label="Route Remaining"
          value={data.route.length}
          unit="nodes"
        />
        {data.destinationNodeId && (
          <KeyValue label="Destination" value={data.destinationNodeId} />
        )}
        {data.currentEdgeId && (
          <div className="space-y-1">
            <KeyValue
              label="Segment Progress"
              value={progressPercent}
              unit="%"
            />
            <div className="h-1 w-full overflow-hidden rounded-full bg-black/5">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </>
  );
}
