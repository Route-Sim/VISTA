import {
  Car,
  Fuel,
  ParkingSquare,
  Moon,
  AlertTriangle,
  Coins,
} from 'lucide-react';
import { useSimSnapshot } from '@/hud/hooks/use-sim-snapshot';
import { CardContent } from '@/hud/ui/card';
import { Separator } from '@/hud/ui/separator';
import { Badge } from '@/hud/ui/badge';
import { KeyValue, InspectorHeader, SectionHeader } from './common';
import type { Truck } from '@/sim/domain/entities';
import { getRoadById } from '@/sim/selectors';

interface AgentInspectorProps {
  id: string;
  data: Truck;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins < 60) return `${mins}m ${secs}s`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m`;
}

function getTruckStatus(data: Truck): {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
} {
  if (data.isResting) return { label: 'Resting', variant: 'secondary' };
  if (data.isFueling) return { label: 'Fueling', variant: 'outline' };
  if (data.isSeekingGasStation)
    return { label: 'Low Fuel', variant: 'destructive' };
  if (data.isSeekingParking) return { label: 'Seeking Parking', variant: 'outline' };
  if (data.currentSpeed > 0.1) return { label: 'Moving', variant: 'default' };
  return { label: 'Idle', variant: 'secondary' };
}

export function AgentInspector({ id, data }: AgentInspectorProps) {
  const snapshot = useSimSnapshot();
  const currentRoad = data.currentEdgeId
    ? getRoadById(snapshot, data.currentEdgeId)
    : undefined;
  const edgeLength = currentRoad?.lengthM ?? 1;
  const progressPercent = Math.round((data.edgeProgress / edgeLength) * 100);
  const fuelPercent = Math.round((data.currentFuel / data.maxFuel) * 100);
  const loadPercent =
    data.capacity > 0
      ? Math.round((data.packageIds.length / data.capacity) * 100)
      : 0;

  const status = getTruckStatus(data);
  const fuelColor =
    fuelPercent < 20
      ? 'bg-red-500'
      : fuelPercent < 50
        ? 'bg-amber-500'
        : 'bg-emerald-500';

  return (
    <>
      <InspectorHeader icon={Car} title="Delivery Truck" id={id} />
      <Separator />

      {/* Status Badges */}
      <CardContent className="flex flex-wrap gap-1.5 p-3 pb-2">
        <Badge variant={status.variant}>{status.label}</Badge>
        {data.isSeekingGasStation && (
          <Badge variant="destructive" className="gap-1">
            <Fuel className="h-3 w-3" /> Low Fuel
          </Badge>
        )}
        {data.isSeekingParking && (
          <Badge variant="outline" className="gap-1">
            <ParkingSquare className="h-3 w-3" /> Seeking Rest
          </Badge>
        )}
        {data.isResting && (
          <Badge variant="secondary" className="gap-1">
            <Moon className="h-3 w-3" /> Resting
          </Badge>
        )}
      </CardContent>

      <Separator />
      <SectionHeader title="Movement" />
      <CardContent className="space-y-2 p-3 pt-2">
        <KeyValue
          label="Speed"
          value={Math.round(data.currentSpeed)}
          unit={`/ ${Math.round(data.maxSpeed)} km/h`}
        />
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded bg-black/5 p-2 text-center">
            <div className="text-[10px] font-semibold text-black/40 uppercase">
              Driving Time
            </div>
            <div className="font-mono text-sm text-black/90">
              {formatTime(data.drivingTimeS)}
            </div>
          </div>
          <div className="rounded bg-black/5 p-2 text-center">
            <div className="text-[10px] font-semibold text-black/40 uppercase">
              Rest Time
            </div>
            <div className="font-mono text-sm text-black/90">
              {formatTime(data.restingTimeS)}
            </div>
          </div>
        </div>
      </CardContent>

      <Separator />
      <SectionHeader title="Fuel & Emissions" />
      <CardContent className="space-y-2 p-3 pt-2">
        <div className="space-y-1">
          <KeyValue
            label="Fuel Level"
            value={`${Math.round(data.currentFuel)} L`}
            unit={`/ ${Math.round(data.maxFuel)} L`}
          />
          <div className="h-2 w-full overflow-hidden rounded-full bg-black/5">
            <div
              className={`h-full ${fuelColor} transition-all duration-500`}
              style={{ width: `${fuelPercent}%` }}
            />
          </div>
        </div>
        <KeyValue
          label="CO₂ Emitted"
          value={data.co2Emission.toFixed(2)}
          unit="kg"
        />
      </CardContent>

      <Separator />
      <SectionHeader title="Cargo & Logistics" />
      <CardContent className="space-y-2 p-3 pt-2">
        <div className="space-y-1">
          <KeyValue
            label="Cargo Load"
            value={`${data.packageIds.length}/${data.capacity}`}
            unit={`(${loadPercent}%)`}
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
      <SectionHeader title="Economics" />
      <CardContent className="space-y-2 p-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-sm text-black/60">
            <Coins className="h-3.5 w-3.5" /> Balance
          </span>
          <span className="font-medium text-black/90">
            {data.balanceDucats.toFixed(0)}{' '}
            <span className="text-xs text-black/50">₫</span>
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-sm text-black/60">
            <AlertTriangle className="h-3.5 w-3.5" /> Risk Factor
          </span>
          <span className="font-medium text-black/90">
            {(data.riskFactor * 100).toFixed(0)}%
          </span>
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
        {data.routeEndNodeId && (
          <KeyValue
            label="Destination"
            value={
              <span className="font-mono text-xs">
                {String(data.routeEndNodeId)}
              </span>
            }
          />
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
        {data.currentBuildingId && (
          <KeyValue
            label="At Building"
            value={
              <span className="font-mono text-xs">
                {String(data.currentBuildingId).slice(0, 20)}...
              </span>
            }
          />
        )}
      </CardContent>
    </>
  );
}
