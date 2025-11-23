import { Milestone } from 'lucide-react';
import { CardContent } from '@/hud/ui/card';
import { Separator } from '@/hud/ui/separator';
import { KeyValue, InspectorHeader, SectionHeader } from './common';
import type { Road } from '@/sim/domain/entities';

interface RoadInspectorProps {
  id: string;
  data: Road;
}

export function RoadInspector({ id, data }: RoadInspectorProps) {
  return (
    <>
      <InspectorHeader
        icon={Milestone}
        title="Road Segment"
        id={id}
        subtitle={`${Math.round(data.lengthM)}m`}
      />
      <Separator />

      <SectionHeader title="Specifications" />
      <CardContent className="space-y-2 p-3 pt-2">
        <KeyValue label="Class" value={data.roadClass} />
        <KeyValue label="Lanes" value={data.lanes} />
        <KeyValue label="Speed Limit" value={data.maxSpeedKph} unit="km/h" />
        {data.weightLimitKg && (
          <KeyValue label="Weight Limit" value={data.weightLimitKg} unit="kg" />
        )}
        <KeyValue label="Mode" value={data.mode} />
      </CardContent>

      <Separator />
      <SectionHeader title="Topology" />
      <CardContent className="space-y-2 p-3 pt-2">
        <div className="flex items-center justify-between rounded bg-black/5 p-2 font-mono text-xs text-black/70">
          <span>{data.startNodeId}</span>
          <span className="text-black/30">→</span>
          <span>{data.endNodeId}</span>
        </div>
      </CardContent>

      <Separator />
      <SectionHeader title="Live Traffic" />
      <CardContent className="space-y-2 p-3 pt-2">
        <KeyValue
          label="Vehicles on Road"
          value={data.truckIds.length}
          unit="active"
        />
      </CardContent>
    </>
  );
}
