import * as React from 'react';
import {
  Truck,
  Building2,
  ParkingCircle,
  Fuel,
  Search,
  ChevronDown,
} from 'lucide-react';
import { focusStore } from '@/hud/state/focus-state';
import { useSimSnapshot } from '@/hud/hooks/use-sim-snapshot';
import { getAllTrucks, getAllBuildings } from '@/sim/selectors';
import { Card } from '@/hud/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/hud/ui/command';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/hud/ui/collapsible';
import { Button } from '@/hud/ui/button';
import { cn } from '@/hud/lib/utils';
import type {
  Truck as TruckEntity,
  Site,
  Parking,
  GasStation,
} from '@/sim/domain/entities';

function getBuildingIcon(kind: string) {
  switch (kind) {
    case 'site':
      return Building2;
    case 'parking':
      return ParkingCircle;
    case 'gas_station':
      return Fuel;
    default:
      return Building2;
  }
}

function getBuildingLabel(building: Site | Parking | GasStation): string {
  if (building.kind === 'site' && building.name) {
    return building.name;
  }
  const kindLabels: Record<string, string> = {
    site: 'Site',
    parking: 'Parking',
    gas_station: 'Gas Station',
  };
  return `${kindLabels[building.kind] ?? 'Building'} ${building.id.slice(-6)}`;
}

function getTruckLabel(truck: TruckEntity): string {
  return `Truck ${truck.id.slice(-6)}`;
}

export function ObjectPicker() {
  const snapshot = useSimSnapshot();
  const [isOpen, setIsOpen] = React.useState(false);

  const trucks = React.useMemo(() => getAllTrucks(snapshot), [snapshot]);
  const buildings = React.useMemo(() => getAllBuildings(snapshot), [snapshot]);

  const handleSelectTruck = (truck: TruckEntity) => {
    focusStore.setFocus(truck.id, 'agent');
  };

  const handleSelectBuilding = (building: Site | Parking | GasStation) => {
    focusStore.setFocus(building.id, 'building');
  };

  const totalCount = trucks.length + buildings.length;

  if (totalCount === 0) {
    return null;
  }

  return (
    <div className="pointer-events-auto w-96">
      <Card className="overflow-hidden rounded-xl border border-black/10 bg-white/90 shadow-lg backdrop-blur-sm">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="flex w-full items-center justify-between gap-2 rounded-none px-3 py-2 text-sm font-medium hover:bg-black/5"
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-black/60" />
                <span>Find Object</span>
                <span className="text-xs text-black/40">({totalCount})</span>
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-black/40 transition-transform',
                  isOpen && 'rotate-180',
                )}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Command className="border-t border-black/10">
              <CommandInput placeholder="Search trucks, buildings..." />
              <CommandList className="max-h-64">
                <CommandEmpty>No results found.</CommandEmpty>

                {trucks.length > 0 && (
                  <CommandGroup heading="Trucks">
                    {trucks.map((truck) => (
                      <CommandItem
                        key={truck.id}
                        value={`truck ${truck.id} ${getTruckLabel(truck)}`}
                        onSelect={() => handleSelectTruck(truck)}
                        className="cursor-pointer"
                      >
                        <Truck className="h-4 w-4 text-blue-600" />
                        <span className="flex-1">{getTruckLabel(truck)}</span>
                        <span className="text-xs text-black/40">
                          {truck.packageIds.length} pkg
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {buildings.length > 0 && (
                  <CommandGroup heading="Buildings">
                    {buildings.map((building) => {
                      const Icon = getBuildingIcon(building.kind);
                      return (
                        <CommandItem
                          key={building.id}
                          value={`building ${building.kind} ${building.id} ${getBuildingLabel(building)}`}
                          onSelect={() => handleSelectBuilding(building)}
                          className="cursor-pointer"
                        >
                          <Icon
                            className={cn(
                              'h-4 w-4',
                              building.kind === 'site' && 'text-amber-600',
                              building.kind === 'parking' && 'text-green-600',
                              building.kind === 'gas_station' && 'text-red-600',
                            )}
                          />
                          <span className="flex-1">
                            {getBuildingLabel(building)}
                          </span>
                          <span className="text-xs capitalize text-black/40">
                            {building.kind.replace('_', ' ')}
                          </span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}
