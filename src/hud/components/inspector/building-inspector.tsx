import { Warehouse, ParkingSquare } from 'lucide-react';
import { CardContent } from '@/hud/ui/card';
import { Separator } from '@/hud/ui/separator';
import { KeyValue, InspectorHeader, SectionHeader } from './common';
import type { Parking, Site } from '@/sim/domain/entities';

interface ParkingInspectorProps {
  id: string;
  data: Parking;
}

export function ParkingInspector({ id, data }: ParkingInspectorProps) {
  const occupancyPercent =
    data.capacity > 0
      ? Math.round((data.truckIds.length / data.capacity) * 100)
      : 0;

  return (
    <>
      <InspectorHeader
        icon={ParkingSquare}
        title="Parking Lot"
        id={id}
        subtitle={data.truckIds.length > 0 ? 'Occupied' : 'Empty'}
      />
      <Separator />

      <SectionHeader title="Properties" />
      <CardContent className="space-y-2 p-3 pt-2">
        <KeyValue label="Attached Node" value={data.nodeId} />
        <KeyValue label="Total Capacity" value={data.capacity} unit="spots" />
      </CardContent>

      <Separator />
      <SectionHeader title="Occupancy" />
      <CardContent className="space-y-2 p-3 pt-2">
        <div className="space-y-1">
          <KeyValue
            label="Vehicles Parked"
            value={`${data.truckIds.length}/${data.capacity}`}
            unit={`(${occupancyPercent}%)`}
          />
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
        </div>
      </CardContent>
    </>
  );
}

interface SiteInspectorProps {
  id: string;
  data: Site;
}

export function SiteInspector({ id, data }: SiteInspectorProps) {
  const stats = data.statistics;
  const hasStats = stats && stats.packagesGenerated > 0;

  return (
    <>
      <InspectorHeader
        icon={Warehouse}
        title="Delivery Site"
        id={id}
        subtitle={data.name}
      />
      <Separator />

      <SectionHeader title="Properties" />
      <CardContent className="space-y-2 p-3 pt-2">
        <KeyValue label="Attached Node" value={data.nodeId} />
        {data.capacity !== undefined && (
          <KeyValue label="Capacity" value={data.capacity} unit="vehicles" />
        )}
        {data.activityRate !== undefined && (
          <KeyValue
            label="Activity Rate"
            value={data.activityRate.toFixed(1)}
            unit="pkg/tick"
          />
        )}
        {data.loadingRateTonnesPerMin !== undefined && (
          <KeyValue
            label="Loading Rate"
            value={data.loadingRateTonnesPerMin.toFixed(2)}
            unit="t/min"
          />
        )}
      </CardContent>

      <Separator />
      <SectionHeader title="Current Activity" />
      <CardContent className="space-y-2 p-3 pt-2">
        <KeyValue
          label="Vehicles Present"
          value={data.truckIds.length}
          unit="trucks"
        />
        <KeyValue
          label="Packages Pending"
          value={data.packageIds.length}
          unit="items"
        />
      </CardContent>

      {hasStats && (
        <>
          <Separator />
          <SectionHeader title="Statistics" />
          <CardContent className="space-y-2 p-3 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded bg-black/5 p-2 text-center">
                <div className="text-[10px] font-semibold text-black/40 uppercase">
                  Generated
                </div>
                <div className="font-medium text-black/90">
                  {stats.packagesGenerated}
                </div>
              </div>
              <div className="rounded bg-black/5 p-2 text-center">
                <div className="text-[10px] font-semibold text-black/40 uppercase">
                  Picked Up
                </div>
                <div className="font-medium text-black/90">
                  {stats.packagesPickedUp}
                </div>
              </div>
              <div className="rounded bg-emerald-50 p-2 text-center">
                <div className="text-[10px] font-semibold text-emerald-600/60 uppercase">
                  Delivered
                </div>
                <div className="font-medium text-emerald-700">
                  {stats.packagesDelivered}
                </div>
              </div>
              <div className="rounded bg-red-50 p-2 text-center">
                <div className="text-[10px] font-semibold text-red-600/60 uppercase">
                  Expired
                </div>
                <div className="font-medium text-red-700">
                  {stats.packagesExpired}
                </div>
              </div>
            </div>
            {(stats.totalValueDelivered > 0 || stats.totalValueExpired > 0) && (
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div className="text-center">
                  <span className="text-black/50">Value Delivered: </span>
                  <span className="font-medium text-emerald-600">
                    {stats.totalValueDelivered.toFixed(0)} ₫
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-black/50">Value Lost: </span>
                  <span className="font-medium text-red-600">
                    {stats.totalValueExpired.toFixed(0)} ₫
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </>
      )}

      {data.destinationWeights &&
        Object.keys(data.destinationWeights).length > 0 && (
          <>
            <Separator />
            <SectionHeader title="Destinations" />
            <CardContent className="space-y-1 p-3 pt-2">
              {Object.entries(data.destinationWeights)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 4)
                .map(([destId, weight]) => (
                  <div
                    key={destId}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="truncate font-mono text-black/60">
                      {destId.slice(0, 20)}...
                    </span>
                    <span className="font-medium text-black/80">
                      {(weight * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
            </CardContent>
          </>
        )}
    </>
  );
}

// Legacy export for backwards compatibility
interface BuildingInspectorProps {
  id: string;
  data: Parking | Site;
}

export function BuildingInspector({ id, data }: BuildingInspectorProps) {
  if (data.kind === 'parking') {
    return <ParkingInspector id={id} data={data} />;
  }
  return <SiteInspector id={id} data={data as Site} />;
}
