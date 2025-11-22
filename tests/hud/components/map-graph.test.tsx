import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MapGraph } from '@/hud/components/map-graph';
import type { SignalData } from '@/net';

// Mock Konva components because they rely on canvas which is heavy to test fully in happy-dom
// and often requires mocking canvas API methods.
// However, happy-dom has partial canvas support. 
// Let's try shallow mocking konva to just render divs or check props.

vi.mock('react-konva', () => ({
  Stage: ({ children, ...props }: any) => (
    <div data-testid="stage" data-props={JSON.stringify(props)}>{children}</div>
  ),
  Layer: ({ children }: any) => <div data-testid="layer">{children}</div>,
  Line: (props: any) => <div data-testid="line" data-props={JSON.stringify(props)} />,
  Circle: (props: any) => <div data-testid="circle" data-props={JSON.stringify(props)} />,
}));

describe('MapGraph', () => {
  const mockData: SignalData['map.created'] = {
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
  };

  it('should render stats and legend', () => {
    render(<MapGraph data={mockData} />);

    expect(screen.getByText(/2 nodes/)).toBeInTheDocument();
    expect(screen.getByText(/Legend/)).toBeInTheDocument();
  });

  it('should render graph elements via Konva', () => {
    render(<MapGraph data={mockData} />);

    // Check mocked konva elements
    expect(screen.getByTestId('stage')).toBeInTheDocument();
    expect(screen.getByTestId('layer')).toBeInTheDocument();
    
    const circles = screen.getAllByTestId('circle');
    expect(circles).toHaveLength(2);

    const lines = screen.getAllByTestId('line');
    expect(lines).toHaveLength(1);
  });
});

