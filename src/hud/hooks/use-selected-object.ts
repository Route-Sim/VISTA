import { useFocusState, type FocusType } from '@/hud/state/focus-state';
import { useSimSnapshot } from './use-sim-snapshot';
import type {
  EntityKind,
  Node,
  Road,
  Parking,
  Site,
  GasStation,
  Truck,
} from '@/sim';

type SelectedObject =
  | { kind: 'node'; data: Node }
  | { kind: 'road'; data: Road }
  | { kind: 'parking'; data: Parking }
  | { kind: 'site'; data: Site }
  | { kind: 'gas_station'; data: GasStation }
  | { kind: 'agent'; data: Truck }
  | { kind: 'tree'; data: null }
  | null;

export function useSelectedObject(): {
  id: string | null;
  type: FocusType | null;
  object: SelectedObject;
} {
  const { focusedId, focusedType } = useFocusState();
  const snapshot = useSimSnapshot();

  if (!focusedId || !focusedType) {
    return { id: null, type: null, object: null };
  }

  let object: SelectedObject = null;

  if (focusedType === 'node') {
    const node = snapshot.nodes[focusedId];
    if (node) object = { kind: 'node', data: node };
  } else if (focusedType === 'road') {
    const road = snapshot.roads[focusedId];
    if (road) object = { kind: 'road', data: road };
  } else if (focusedType === 'building') {
    const building = snapshot.buildings[focusedId];
    if (building) {
      if (building.kind === 'site') {
        object = { kind: 'site', data: building };
      } else if (building.kind === 'gas_station') {
        object = { kind: 'gas_station', data: building };
      } else {
        object = { kind: 'parking', data: building };
      }
    }
  } else if (focusedType === 'agent') {
    const truck = snapshot.trucks[focusedId];
    if (truck) object = { kind: 'agent', data: truck };
  } else if (focusedType === 'tree') {
    object = { kind: 'tree', data: null };
  }

  return { id: focusedId, type: focusedType, object };
}

