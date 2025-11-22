import { describe, it, expect } from 'vitest';
import { mapNetEvent } from '@/sim/adapters/net-adapter';
import type { SignalEnvelopeOf } from '@/net';

describe('Net Adapter', () => {
  it('should map map.created', () => {
    const payload: SignalEnvelopeOf<'map.created'> = {
      signal: 'map.created',
      data: {
        map_width: 1000,
        map_height: 1000,
        num_major_centers: 1,
        minor_per_major: 0,
        center_separation: 100,
        urban_sprawl: 1,
        local_density: 1,
        rural_density: 0,
        intra_connectivity: 0,
        inter_connectivity: 1,
        arterial_ratio: 0,
        gridness: 0,
        ring_road_prob: 0,
        highway_curviness: 0,
        rural_settlement_prob: 0,
        urban_sites_per_km2: 0,
        rural_sites_per_km2: 0,
        urban_activity_rate_range: [0, 0],
        rural_activity_rate_range: [0, 0],
        seed: 123,
        generated_nodes: 2,
        generated_edges: 1,
        generated_sites: 0,
        graph: {
          nodes: [
            { id: 'n1', x: 100, y: 100, buildings: [] },
            { id: 'n2', x: 900, y: 900, buildings: [] },
          ],
          edges: [
            {
              id: 'e1',
              from_node: 'n1',
              to_node: 'n2',
              length_m: 1000,
              mode: 0,
              road_class: 'A',
              lanes: 2,
              max_speed_kph: 100,
              weight_limit_kg: null,
            },
          ],
        },
      },
    };

    const event = mapNetEvent(payload);
    expect(event).toBeDefined();
    if (!event || event.type !== 'map.created') throw new Error('Invalid event type');

    expect(event.nodes['n1']).toBeDefined();
    expect(event.nodes['n2']).toBeDefined();
    expect(event.edges['e1']).toBeDefined();
    expect(event.roads['e1']).toBeDefined();
    expect(event.roads['e1'].roadClass).toBe('A');
  });

  it('should map agent.created (truck)', () => {
    const payload: SignalEnvelopeOf<'agent.created'> = {
      signal: 'agent.created',
      data: {
        id: 't1',
        kind: 'truck',
        inbox_count: 0,
        outbox_count: 0,
        tags: { capacity: 100 },
        max_speed_kph: 80,
        current_speed_kph: 50,
        current_node: 'n1',
        current_edge: null,
        edge_progress_m: 0,
        route: ['e1'],
        destination: null,
        route_start_node: null,
        route_end_node: null,
        current_building_id: null,
      },
    };

    const event = mapNetEvent(payload);
    expect(event).toBeDefined();
    if (!event || event.type !== 'truck.created') throw new Error('Invalid event type');

    expect(event.truck.id).toBe('t1');
    expect(event.truck.capacity).toBe(100);
    expect(event.truck.currentNodeId).toBe('n1');
    expect(event.truck.route).toContain('e1');
  });

  it('should map agent.updated', () => {
    const payload: SignalEnvelopeOf<'agent.updated'> = {
      signal: 'agent.updated',
      data: {
        agent_id: 't1',
        current_speed_kph: 60,
        edge_progress_m: 50,
      },
    };

    const event = mapNetEvent(payload);
    expect(event).toBeDefined();
    if (!event || event.type !== 'agent.updated') throw new Error('Invalid event type');

    expect(event.id).toBe('t1');
    expect(event.patch.currentSpeed).toBe(60);
    expect(event.patch.edgeProgress).toBe(50);
  });

  it('should map agent.deleted', () => {
    const payload: SignalEnvelopeOf<'agent.deleted'> = {
      signal: 'agent.deleted',
      data: { agent_id: 't1' },
    };

    const event = mapNetEvent(payload);
    expect(event).toEqual({ type: 'agent.deleted', id: 't1' });
  });

  it('should return undefined for unknown signals', () => {
    const payload = { signal: 'unknown.signal', data: {} };
    expect(mapNetEvent(payload)).toBeUndefined();
  });
});

