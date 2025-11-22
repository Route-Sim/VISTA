import { describe, it, expect, vi } from 'vitest';
import { wireNetToSim } from '@/sim/adapters/wire-net-to-sim';
import type { WebSocketClient } from '@/net';
import type { SimStore } from '@/sim/store/sim-store';

describe('Wire Net to Sim', () => {
  it('should subscribe to signals and ingest into store', () => {
    // Mock store
    const store = {
      ingest: vi.fn(),
    } as unknown as SimStore;

    // Mock net client with manual trigger
    const handlers: Record<string, (data: any) => void> = {};
    const net = {
      on: vi.fn((signal, handler) => {
        handlers[signal] = handler;
        return () => {};
      }),
    } as unknown as WebSocketClient;

    wireNetToSim(net, store);

    // Verify subscriptions
    expect(net.on).toHaveBeenCalledWith('tick.start', expect.any(Function));
    expect(net.on).toHaveBeenCalledWith('map.created', expect.any(Function));
    expect(net.on).toHaveBeenCalledWith('agent.created', expect.any(Function));

    // Simulate tick event
    handlers['tick.start']({ tick: 100 });
    expect(store.ingest).toHaveBeenCalledWith(expect.objectContaining({
      type: 'tick.start',
      tick: 100,
    }));

    // Simulate map event (needs full payload structure expected by mapNetEvent)
    // Note: wireNetToSim wraps data into { signal, data } before calling mapNetEvent
    // The handler registered via net.on receives just `data`.
    // mapNetEvent expects `payload` which can be envelope OR data.
    // Let's check implementation: 
    // off.push(net.on('map.created', (data) => forward('map.created', data)));
    // forward constructs { signal, data }.
    // mapNetEvent checks isSignalEnvelope.
    
    const mapData = {
      map_width: 100, map_height: 100,
      graph: { nodes: [], edges: [] },
      // ... other required fields ignored by partial mock if adapter is robust enough or we provide minimal valid shape
      // minimal valid shape for mapNetEvent:
      generated_nodes: 0, generated_edges: 0, generated_sites: 0,
      num_major_centers: 0, minor_per_major: 0, center_separation: 0, urban_sprawl: 0,
      local_density: 0, rural_density: 0, intra_connectivity: 0, inter_connectivity: 0,
      arterial_ratio: 0, gridness: 0, ring_road_prob: 0, highway_curviness: 0,
      rural_settlement_prob: 0, urban_sites_per_km2: 0, rural_sites_per_km2: 0,
      urban_activity_rate_range: [0,0], rural_activity_rate_range: [0,0], seed: 0
    };
    
    handlers['map.created'](mapData);
    
    // Should have ingested map.created event
    expect(store.ingest).toHaveBeenCalledWith(expect.objectContaining({
      type: 'map.created',
    }));
  });
});

