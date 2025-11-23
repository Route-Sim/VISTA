import * as React from 'react';
import { useFocusState } from '@/hud/state/focus-state';
import { useSelectedObject } from '@/hud/hooks/use-selected-object';
import { Button } from '@/hud/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/hud/ui/card';
import { Separator } from '@/hud/ui/separator';
import {
  X,
  Car,
  MapPin,
  Building,
  Milestone,
  TreeDeciduous,
} from 'lucide-react';

function KeyValue({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-black/60">{label}</span>
      <span className="font-medium text-black/90">{value}</span>
    </div>
  );
}

function InspectorHeader({
  icon: Icon,
  title,
  id,
}: {
  icon: any;
  title: string;
  id: string;
}) {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
      <div className="flex min-w-0 items-center gap-2">
        <div className="rounded-md bg-black/5 p-1.5">
          <Icon className="h-4 w-4 text-black/70" />
        </div>
        <div className="min-w-0">
          <CardTitle className="truncate text-sm font-semibold text-black/90">
            {title}
          </CardTitle>
          <div className="truncate font-mono text-[10px] text-black/50">
            {id}
          </div>
        </div>
      </div>
    </CardHeader>
  );
}

function InspectorFooter({ onClose }: { onClose: () => void }) {
  return (
    <CardFooter className="mt-4 px-2 py-2">
      <Button variant="outline" size="lg" onClick={onClose} className="w-full">
        <X className="h-4 w-4" />
        Return to the default view
      </Button>
    </CardFooter>
  );
}

export function FocusInspector() {
  const { clearFocus } = useFocusState();
  const { id, type, object } = useSelectedObject();

  if (!id || !type) return null;

  return (
    <div className="pointer-events-auto w-96">
      <Card className="rounded-xl border border-black/10 bg-white/90 shadow-lg backdrop-blur-sm">
        {object?.kind === 'agent' && (
          <>
            <InspectorHeader icon={Car} title="Delivery Truck" id={id} />
            <Separator />
            <CardContent className="space-y-2 p-3">
              <KeyValue
                label="Speed"
                value={`${Math.round(object.data.currentSpeed)} km/h`}
              />
              <KeyValue
                label="Fuel"
                value={`${Math.round(object.data.currentFuel)} L`}
              />
              <KeyValue
                label="Cargo"
                value={`${object.data.packageIds.length} packages`}
              />
              <KeyValue
                label="Route"
                value={`${object.data.route.length} steps`}
              />
            </CardContent>
          </>
        )}

        {object?.kind === 'road' && (
          <>
            <InspectorHeader icon={Milestone} title="Road Segment" id={id} />
            <Separator />
            <CardContent className="space-y-2 p-3">
              <KeyValue label="Type" value={object.data.roadClass} />
              <KeyValue label="Lanes" value={object.data.lanes} />
              <KeyValue
                label="Speed Limit"
                value={`${object.data.maxSpeedKph} km/h`}
              />
              <KeyValue
                label="Length"
                value={`${Math.round(object.data.lengthM)} m`}
              />
              <KeyValue
                label="Traffic"
                value={`${object.data.truckIds.length} vehicles`}
              />
            </CardContent>
          </>
        )}

        {object?.kind === 'node' && (
          <>
            <InspectorHeader icon={MapPin} title="Intersection" id={id} />
            <Separator />
            <CardContent className="space-y-2 p-3">
              <KeyValue
                label="Position"
                value={`${Math.round(object.data.x)}, ${Math.round(object.data.y)}`}
              />
              <KeyValue
                label="Buildings"
                value={object.data.buildingIds.length}
              />
            </CardContent>
          </>
        )}

        {(object?.kind === 'site' || object?.kind === 'parking') && (
          <>
            <InspectorHeader
              icon={Building}
              title={object.kind === 'site' ? 'Delivery Site' : 'Parking Lot'}
              id={id}
            />
            <Separator />
            <CardContent className="space-y-2 p-3">
              {object.kind === 'parking' ? (
                <KeyValue
                  label="Capacity"
                  value={`${object.data.capacity} spots`}
                />
              ) : (
                <KeyValue
                  label="Pending"
                  value={`${object.data.packageIds.length} packages`}
                />
              )}
              <KeyValue label="Vehicles" value={object.data.truckIds.length} />
            </CardContent>
          </>
        )}

        {object?.kind === 'tree' && (
          <>
            <InspectorHeader
              icon={TreeDeciduous}
              title="Tree"
              id="visual-object"
            />
            <Separator />
            <CardContent className="p-3">
              <div className="text-center text-sm text-black/60 italic">
                Purely decorative vegetation.
              </div>
            </CardContent>
          </>
        )}

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
