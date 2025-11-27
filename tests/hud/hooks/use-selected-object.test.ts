import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSelectedObject } from '@/hud/hooks/use-selected-object';
import { useFocusState } from '@/hud/state/focus-state';
import { useSimSnapshot } from '@/hud/hooks/use-sim-snapshot';
import { createEmptySnapshot } from '@/sim/store/snapshot';
import { asNodeId, asRoadId, asBuildingId, asTruckId } from '@/sim/domain/ids';
import type { SimSnapshot } from '@/sim';

// Mock the hooks
vi.mock('@/hud/state/focus-state', () => ({
  useFocusState: vi.fn(),
}));

vi.mock('@/hud/hooks/use-sim-snapshot', () => ({
  useSimSnapshot: vi.fn(),
}));

describe('useSelectedObject', () => {
  let mockSnapshot: SimSnapshot;
  const mockUseFocusState = useFocusState as ReturnType<typeof vi.fn>;
  const mockUseSimSnapshot = useSimSnapshot as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSnapshot = createEmptySnapshot();
    mockUseSimSnapshot.mockReturnValue(mockSnapshot);
  });

  it('should return null when no focus is set', () => {
    mockUseFocusState.mockReturnValue({
      focusedId: null,
      focusedType: null,
      focusedPosition: null,
      setFocus: vi.fn(),
      clearFocus: vi.fn(),
    });

    const { result } = renderHook(() => useSelectedObject());

    expect(result.current.id).toBeNull();
    expect(result.current.type).toBeNull();
    expect(result.current.object).toBeNull();
  });

  it('should return node object when node is focused', () => {
    const nodeId = asNodeId('n1');
    const node = { id: nodeId, x: 10, y: 20, buildingIds: [] };
    mockSnapshot.nodes[nodeId] = node;

    mockUseFocusState.mockReturnValue({
      focusedId: nodeId,
      focusedType: 'node',
      focusedPosition: null,
      setFocus: vi.fn(),
      clearFocus: vi.fn(),
    });

    const { result } = renderHook(() => useSelectedObject());

    expect(result.current.id).toBe(nodeId);
    expect(result.current.type).toBe('node');
    expect(result.current.object).toEqual({ kind: 'node', data: node });
  });

  it('should return null when focused node does not exist in snapshot', () => {
    const nodeId = asNodeId('nonexistent');
    
    mockUseFocusState.mockReturnValue({
      focusedId: nodeId,
      focusedType: 'node',
      focusedPosition: null,
      setFocus: vi.fn(),
      clearFocus: vi.fn(),
    });

    const { result } = renderHook(() => useSelectedObject());

    expect(result.current.id).toBe(nodeId);
    expect(result.current.type).toBe('node');
    expect(result.current.object).toBeNull();
  });

  it('should return road object when road is focused', () => {
    const roadId = asRoadId('r1');
    const road = {
      id: roadId,
      startNodeId: asNodeId('n1'),
      endNodeId: asNodeId('n2'),
      lengthM: 100,
      roadClass: 'primary' as const,
      mode: 1,
      lanes: 2,
      maxSpeedKph: 60,
      weightLimitKg: null,
      truckIds: [],
    };
    mockSnapshot.roads[roadId] = road;

    mockUseFocusState.mockReturnValue({
      focusedId: roadId,
      focusedType: 'road',
      focusedPosition: null,
      setFocus: vi.fn(),
      clearFocus: vi.fn(),
    });

    const { result } = renderHook(() => useSelectedObject());

    expect(result.current.id).toBe(roadId);
    expect(result.current.type).toBe('road');
    expect(result.current.object).toEqual({ kind: 'road', data: road });
  });

  it('should return null when focused road does not exist in snapshot', () => {
    const roadId = asRoadId('nonexistent');
    
    mockUseFocusState.mockReturnValue({
      focusedId: roadId,
      focusedType: 'road',
      focusedPosition: null,
      setFocus: vi.fn(),
      clearFocus: vi.fn(),
    });

    const { result } = renderHook(() => useSelectedObject());

    expect(result.current.id).toBe(roadId);
    expect(result.current.type).toBe('road');
    expect(result.current.object).toBeNull();
  });

  it('should return site object when site building is focused', () => {
    const buildingId = asBuildingId('site1');
    const site = {
      id: buildingId,
      nodeId: asNodeId('n1'),
      kind: 'site' as const,
      truckIds: [],
      packageIds: [],
    };
    mockSnapshot.buildings[buildingId] = site;

    mockUseFocusState.mockReturnValue({
      focusedId: buildingId,
      focusedType: 'building',
      focusedPosition: null,
      setFocus: vi.fn(),
      clearFocus: vi.fn(),
    });

    const { result } = renderHook(() => useSelectedObject());

    expect(result.current.id).toBe(buildingId);
    expect(result.current.type).toBe('building');
    expect(result.current.object).toEqual({ kind: 'site', data: site });
  });

  it('should return parking object when parking building is focused', () => {
    const buildingId = asBuildingId('parking1');
    const parking = {
      id: buildingId,
      nodeId: asNodeId('n1'),
      kind: 'parking' as const,
      truckIds: [],
      capacity: 10,
    };
    mockSnapshot.buildings[buildingId] = parking;

    mockUseFocusState.mockReturnValue({
      focusedId: buildingId,
      focusedType: 'building',
      focusedPosition: null,
      setFocus: vi.fn(),
      clearFocus: vi.fn(),
    });

    const { result } = renderHook(() => useSelectedObject());

    expect(result.current.id).toBe(buildingId);
    expect(result.current.type).toBe('building');
    expect(result.current.object).toEqual({ kind: 'parking', data: parking });
  });

  it('should return null when focused building does not exist in snapshot', () => {
    const buildingId = asBuildingId('nonexistent');
    
    mockUseFocusState.mockReturnValue({
      focusedId: buildingId,
      focusedType: 'building',
      focusedPosition: null,
      setFocus: vi.fn(),
      clearFocus: vi.fn(),
    });

    const { result } = renderHook(() => useSelectedObject());

    expect(result.current.id).toBe(buildingId);
    expect(result.current.type).toBe('building');
    expect(result.current.object).toBeNull();
  });

  it('should return agent object when truck is focused', () => {
    const truckId = asTruckId('t1');
    const truck = {
      id: truckId,
      capacity: 100,
      maxSpeed: 80,
      currentSpeed: 60,
      packageIds: [],
      maxFuel: 100,
      currentFuel: 50,
      co2Emission: 0,
      inboxCount: 0,
      outboxCount: 0,
      currentNodeId: null,
      currentEdgeId: null,
      currentBuildingId: null,
      edgeProgress: 0,
      route: [],
      destinationNodeId: null,
      routeStartNodeId: null,
      routeEndNodeId: null,
    };
    mockSnapshot.trucks[truckId] = truck;

    mockUseFocusState.mockReturnValue({
      focusedId: truckId,
      focusedType: 'agent',
      focusedPosition: null,
      setFocus: vi.fn(),
      clearFocus: vi.fn(),
    });

    const { result } = renderHook(() => useSelectedObject());

    expect(result.current.id).toBe(truckId);
    expect(result.current.type).toBe('agent');
    expect(result.current.object).toEqual({ kind: 'agent', data: truck });
  });

  it('should return null when focused truck does not exist in snapshot', () => {
    const truckId = asTruckId('nonexistent');
    
    mockUseFocusState.mockReturnValue({
      focusedId: truckId,
      focusedType: 'agent',
      focusedPosition: null,
      setFocus: vi.fn(),
      clearFocus: vi.fn(),
    });

    const { result } = renderHook(() => useSelectedObject());

    expect(result.current.id).toBe(truckId);
    expect(result.current.type).toBe('agent');
    expect(result.current.object).toBeNull();
  });

  it('should return tree object when tree is focused', () => {
    const treeId = 'tree1';
    
    mockUseFocusState.mockReturnValue({
      focusedId: treeId,
      focusedType: 'tree',
      focusedPosition: null,
      setFocus: vi.fn(),
      clearFocus: vi.fn(),
    });

    const { result } = renderHook(() => useSelectedObject());

    expect(result.current.id).toBe(treeId);
    expect(result.current.type).toBe('tree');
    expect(result.current.object).toEqual({ kind: 'tree', data: null });
  });

  it('should handle case when focusedId is set but focusedType is null', () => {
    mockUseFocusState.mockReturnValue({
      focusedId: 'some-id',
      focusedType: null,
      focusedPosition: null,
      setFocus: vi.fn(),
      clearFocus: vi.fn(),
    });

    const { result } = renderHook(() => useSelectedObject());

    expect(result.current.id).toBeNull();
    expect(result.current.type).toBeNull();
    expect(result.current.object).toBeNull();
  });

  it('should handle case when focusedType is set but focusedId is null', () => {
    mockUseFocusState.mockReturnValue({
      focusedId: null,
      focusedType: 'node',
      focusedPosition: null,
      setFocus: vi.fn(),
      clearFocus: vi.fn(),
    });

    const { result } = renderHook(() => useSelectedObject());

    expect(result.current.id).toBeNull();
    expect(result.current.type).toBeNull();
    expect(result.current.object).toBeNull();
  });
});

