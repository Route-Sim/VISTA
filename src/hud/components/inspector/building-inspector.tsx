import { Warehouse, ParkingSquare } from 'lucide-react';
import { CardContent } from '@/hud/ui/card';
import { Separator } from '@/hud/ui/separator';
import { KeyValue, InspectorHeader, SectionHeader } from './common';
import type { Parking, Site } from '@/sim/domain/entities';

interface BuildingInspectorProps {
  id: string;
  data: Parking | Site;
}

export function BuildingInspector({ id, data }: BuildingInspectorProps) {
  const isParking = data.kind === 'parking';
  const Icon = isParking ? ParkingSquare : Warehouse;
  const title = isParking ? 'Parking Lot' : 'Delivery Site';

  // Cast explicitly to access union-specific fields safely in TS
  const siteData = !isParking ? (data as Site) : null;
  const parkingData = isParking ? (data as Parking) : null;

  return (
    <>
      <InspectorHeader
        icon={Icon}
        title={title}
        id={id}
        subtitle={siteData?.name}
      />
      <Separator />

      <SectionHeader title="Properties" />
      <CardContent className="space-y-2 p-3 pt-2">
        <KeyValue label="Attached Node" value={data.nodeId} />
        {isParking && parkingData && (
          <KeyValue
            label="Total Capacity"
            value={parkingData.capacity}
            unit="spots"
          />
        )}
        {!isParking && siteData && (
          <KeyValue
            label="Activity Rate"
            value={(siteData.activityRate || 0).toFixed(2)}
          />
        )}
      </CardContent>

      <Separator />
      <SectionHeader title="Activity" />
      <CardContent className="space-y-2 p-3 pt-2">
        <KeyValue
          label="Vehicles Present"
          value={data.truckIds.length}
          unit="trucks"
        />
        {!isParking && siteData && (
          <div className="space-y-1 pt-1">
            <KeyValue
              label="Packages Pending"
              value={siteData.packageIds.length}
              unit="items"
            />
          </div>
        )}
      </CardContent>
    </>
  );
}
