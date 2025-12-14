import { Fuel } from 'lucide-react';
import { CardContent } from '@/hud/ui/card';
import { Separator } from '@/hud/ui/separator';
import { KeyValue, InspectorHeader, SectionHeader } from './common';
import type { GasStation } from '@/sim/domain/entities';

interface GasStationInspectorProps {
  id: string;
  data: GasStation;
}

export function GasStationInspector({ id, data }: GasStationInspectorProps) {
  const occupancyPercent =
    data.capacity > 0
      ? Math.round((data.truckIds.length / data.capacity) * 100)
      : 0;

  return (
    <>
      <InspectorHeader
        icon={Fuel}
        title="Gas Station"
        id={id}
        subtitle={data.truckIds.length > 0 ? 'In Use' : 'Available'}
      />
      <Separator />

      <SectionHeader title="Properties" />
      <CardContent className="space-y-2 p-3 pt-2">
        <KeyValue label="Attached Node" value={data.nodeId} />
        <KeyValue label="Total Capacity" value={data.capacity} unit="vehicles" />
        <KeyValue
          label="Cost Factor"
          value={data.costFactor.toFixed(2)}
          unit="×"
        />
      </CardContent>

      <Separator />
      <SectionHeader title="Current Activity" />
      <CardContent className="space-y-2 p-3 pt-2">
        <div className="space-y-1">
          <KeyValue
            label="Vehicles Fueling"
            value={`${data.truckIds.length}/${data.capacity}`}
            unit={`(${occupancyPercent}%)`}
          />
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
        </div>
        {data.truckIds.length > 0 && (
          <div className="mt-2 space-y-1">
            <span className="text-xs text-black/50">Active Vehicles:</span>
            <div className="flex flex-wrap gap-1">
              {data.truckIds.slice(0, 5).map((truckId) => (
                <span
                  key={truckId}
                  className="rounded bg-black/5 px-1.5 py-0.5 font-mono text-[10px] text-black/70"
                >
                  {truckId.slice(0, 8)}...
                </span>
              ))}
              {data.truckIds.length > 5 && (
                <span className="text-xs text-black/40">
                  +{data.truckIds.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </>
  );
}
