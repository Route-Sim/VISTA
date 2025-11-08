import * as React from 'react';
import { HudContainer } from '@/hud/components/hud-container';
import { Button } from '@/hud/ui/button';
import { Input } from '@/hud/ui/input';
import { Label } from '@/hud/ui/label';
import { Slider } from '@/hud/ui/slider';
import { usePlaybackState } from '@/hud/state/playback-state';
import { net, type ActionParams } from '@/net';
import { cn } from '../lib/utils';

type MapCreateParams = ActionParams['map.create'];

const DEFAULTS: MapCreateParams = {
  map_width: 10000,
  map_height: 10000,
  num_major_centers: 3,
  minor_per_major: 2.0,
  center_separation: 2500.0,
  urban_sprawl: 800.0,
  local_density: 50.0,
  rural_density: 5.0,
  intra_connectivity: 0.3,
  inter_connectivity: 2,
  arterial_ratio: 0.2,
  gridness: 0.3,
  ring_road_prob: 0.5,
  highway_curviness: 0.2,
  rural_settlement_prob: 0.15,
  urban_sites_per_km2: 5.0,
  rural_sites_per_km2: 1.0,
  urban_activity_rate_range: [5.0, 20.0],
  rural_activity_rate_range: [1.0, 8.0],
  seed: 42,
};

export function MapCreator({
  className,
}: {
  className?: string;
}): React.ReactNode {
  const { status } = usePlaybackState();
  const [params, setParams] = React.useState<MapCreateParams>({ ...DEFAULTS });
  const [sending, setSending] = React.useState<boolean>(false);

  const canCreate = status === 'idle' || status === 'stopped';

  const setNumber = <K extends keyof MapCreateParams>(
    key: K,
    value: number,
  ): void => {
    setParams((p) => ({ ...p, [key]: value }));
  };

  const setArrayRange = <
    K extends 'urban_activity_rate_range' | 'rural_activity_rate_range',
  >(
    key: K,
    index: 0 | 1,
    value: number,
  ): void => {
    setParams((p) => {
      const current = p[key] as [number, number];
      const updated: [number, number] = [...current];
      updated[index] = Math.max(0, value);
      return { ...p, [key]: updated };
    });
  };

  const applyPresetDenseUrban = (): void => {
    setParams((p) => ({
      ...p,
      num_major_centers: 5,
      local_density: 80.0,
      rural_density: 0.0,
      gridness: 0.7,
      ring_road_prob: 1.0,
    }));
  };

  const applyPresetSparseRural = (): void => {
    setParams((p) => ({
      ...p,
      num_major_centers: 2,
      local_density: 20.0,
      rural_density: 10.0,
      gridness: 0.0,
      rural_settlement_prob: 0.3,
    }));
  };

  const handleCreate = async (): Promise<void> => {
    if (!canCreate || sending) return;
    setSending(true);
    try {
      await net.sendAction('map.create', params);
    } catch {
      // future: surface via HUD toast
    } finally {
      setSending(false);
    }
  };

  return (
    <HudContainer
      id="map-creator"
      title="Map Creator"
      description="Set parameters for the logistics network map generator to generate and view the map."
      closable={false}
      className={cn('flex h-full flex-col', className)}
    >
      <div className="flex h-full flex-col gap-2">
        <div className="flex items-center justify-between gap-2 pt-4">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setParams({ ...DEFAULTS })}
            >
              Reset Defaults
            </Button>
            <Button variant="outline" size="sm" onClick={applyPresetDenseUrban}>
              Dense Urban
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={applyPresetSparseRural}
            >
              Sparse Rural
            </Button>
          </div>
          <Button
            size="sm"
            className="px-4"
            onClick={handleCreate}
            disabled={!canCreate || sending}
            aria-busy={sending}
          >
            Create Map
          </Button>
        </div>

        <div className="flex-1 overflow-auto py-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Dimensions */}
            <section className="space-y-2">
              <h3 className="text-sm font-medium text-black/80">Dimensions</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2 text-black/70">
                  <Label htmlFor="map_width" className="ml-0.5 text-xs">
                    Map Width (m)
                  </Label>
                  <Input
                    id="map_width"
                    type="number"
                    min={1}
                    value={params.map_width}
                    onChange={(e) =>
                      setNumber('map_width', Number(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-2 text-black/70">
                  <Label htmlFor="map_height" className="ml-0.5 text-xs">
                    Map Height (m)
                  </Label>
                  <Input
                    id="map_height"
                    type="number"
                    min={1}
                    value={params.map_height}
                    onChange={(e) =>
                      setNumber('map_height', Number(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
            </section>

            {/* Structure */}
            <section className="space-y-2">
              <h3 className="text-sm font-medium text-black/80">Structure</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2 text-black/70">
                  <Label htmlFor="num_major_centers" className="ml-0.5 text-xs">
                    Major Centers
                  </Label>
                  <Input
                    id="num_major_centers"
                    type="number"
                    min={1}
                    step={1}
                    value={params.num_major_centers}
                    onChange={(e) =>
                      setNumber(
                        'num_major_centers',
                        Math.max(1, Math.floor(Number(e.target.value) || 1)),
                      )
                    }
                  />
                </div>
                <div className="space-y-2 text-black/70">
                  <Label htmlFor="minor_per_major" className="ml-0.5 text-xs">
                    Minor per Major
                  </Label>
                  <Input
                    id="minor_per_major"
                    type="number"
                    min={0}
                    step={0.1}
                    value={params.minor_per_major}
                    onChange={(e) =>
                      setNumber(
                        'minor_per_major',
                        Math.max(0, Number(e.target.value) || 0),
                      )
                    }
                  />
                </div>
                <div className="space-y-2 text-black/70">
                  <Label htmlFor="center_separation" className="ml-0.5 text-xs">
                    Center Separation (m)
                  </Label>
                  <Input
                    id="center_separation"
                    type="number"
                    min={1}
                    step={1}
                    value={params.center_separation}
                    onChange={(e) =>
                      setNumber(
                        'center_separation',
                        Math.max(1, Number(e.target.value) || 1),
                      )
                    }
                  />
                </div>
                <div className="space-y-2 text-black/70">
                  <Label htmlFor="urban_sprawl" className="ml-0.5 text-xs">
                    Urban Sprawl (m)
                  </Label>
                  <Input
                    id="urban_sprawl"
                    type="number"
                    min={1}
                    step={1}
                    value={params.urban_sprawl}
                    onChange={(e) =>
                      setNumber(
                        'urban_sprawl',
                        Math.max(1, Number(e.target.value) || 1),
                      )
                    }
                  />
                </div>
              </div>
            </section>

            {/* Densities */}
            <section className="space-y-2">
              <h3 className="text-sm font-medium text-black/80">Densities</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2 text-black/70">
                  <Label htmlFor="local_density" className="ml-0.5 text-xs">
                    Local Density (nodes/km²)
                  </Label>
                  <Input
                    id="local_density"
                    type="number"
                    min={0.0001}
                    step={0.1}
                    value={params.local_density}
                    onChange={(e) =>
                      setNumber(
                        'local_density',
                        Math.max(0.0001, Number(e.target.value) || 0),
                      )
                    }
                  />
                </div>
                <div className="space-y-2 text-black/70">
                  <Label htmlFor="rural_density" className="ml-0.5 text-xs">
                    Rural Density (nodes/km²)
                  </Label>
                  <Input
                    id="rural_density"
                    type="number"
                    min={0}
                    step={0.1}
                    value={params.rural_density}
                    onChange={(e) =>
                      setNumber(
                        'rural_density',
                        Math.max(0, Number(e.target.value) || 0),
                      )
                    }
                  />
                </div>
              </div>
            </section>

            {/* Connectivity */}
            <section className="space-y-2">
              <h3 className="text-sm font-medium text-black/80">
                Connectivity
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2 text-black/70">
                  <Label
                    htmlFor="intra_connectivity"
                    className="ml-0.5 text-xs"
                  >
                    Intra Connectivity
                  </Label>
                  <div className="flex items-center gap-3">
                    <Slider
                      min={0}
                      max={1}
                      step={0.01}
                      value={[params.intra_connectivity]}
                      onValueChange={(v) =>
                        setNumber('intra_connectivity', v[0] ?? 0)
                      }
                      aria-label="Intra connectivity"
                    />
                    <span className="w-12 text-right text-xs text-black/70 tabular-nums">
                      {params.intra_connectivity.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-black/70">
                  <Label
                    htmlFor="inter_connectivity"
                    className="ml-0.5 text-xs"
                  >
                    Inter Connectivity (≥1)
                  </Label>
                  <Input
                    id="inter_connectivity"
                    type="number"
                    min={1}
                    step={1}
                    value={params.inter_connectivity}
                    onChange={(e) =>
                      setNumber(
                        'inter_connectivity',
                        Math.max(1, Number(e.target.value) || 1),
                      )
                    }
                  />
                </div>
              </div>
            </section>

            {/* Road composition */}
            <section className="space-y-2">
              <h3 className="text-sm font-medium text-black/80">
                Road composition
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2 text-black/70">
                  <Label htmlFor="arterial_ratio" className="ml-0.5 text-xs">
                    Arterial Ratio
                  </Label>
                  <div className="flex items-center gap-3">
                    <Slider
                      min={0}
                      max={1}
                      step={0.01}
                      value={[params.arterial_ratio]}
                      onValueChange={(v) =>
                        setNumber('arterial_ratio', v[0] ?? 0)
                      }
                      aria-label="Arterial ratio"
                    />
                    <span className="w-12 text-right text-xs text-black/70 tabular-nums">
                      {params.arterial_ratio.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-black/70">
                  <Label htmlFor="gridness" className="ml-0.5 text-xs">
                    Gridness
                  </Label>
                  <div className="flex items-center gap-3">
                    <Slider
                      min={0}
                      max={1}
                      step={0.01}
                      value={[params.gridness]}
                      onValueChange={(v) => setNumber('gridness', v[0] ?? 0)}
                      aria-label="Gridness"
                    />
                    <span className="w-12 text-right text-xs text-black/70 tabular-nums">
                      {params.gridness.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-black/70">
                  <Label htmlFor="ring_road_prob" className="ml-0.5 text-xs">
                    Ring Road Probability
                  </Label>
                  <div className="flex items-center gap-3">
                    <Slider
                      min={0}
                      max={1}
                      step={0.01}
                      value={[params.ring_road_prob]}
                      onValueChange={(v) =>
                        setNumber('ring_road_prob', v[0] ?? 0)
                      }
                      aria-label="Ring road probability"
                    />
                    <span className="w-12 text-right text-xs text-black/70 tabular-nums">
                      {params.ring_road_prob.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="highway_curviness" className="ml-0.5 text-xs">
                    Highway Curviness
                  </Label>
                  <div className="flex items-center gap-3">
                    <Slider
                      min={0}
                      max={1}
                      step={0.01}
                      value={[params.highway_curviness]}
                      onValueChange={(v) =>
                        setNumber('highway_curviness', v[0] ?? 0)
                      }
                      aria-label="Highway curviness"
                    />
                    <span className="w-12 text-right text-xs text-black/70 tabular-nums">
                      {params.highway_curviness.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-black/70">
                  <Label
                    htmlFor="rural_settlement_prob"
                    className="ml-0.5 text-xs"
                  >
                    Rural Settlement Probability
                  </Label>
                  <div className="flex items-center gap-3">
                    <Slider
                      min={0}
                      max={1}
                      step={0.01}
                      value={[params.rural_settlement_prob]}
                      onValueChange={(v) =>
                        setNumber('rural_settlement_prob', v[0] ?? 0)
                      }
                      aria-label="Rural settlement probability"
                    />
                    <span className="w-12 text-right text-xs text-black/70 tabular-nums">
                      {params.rural_settlement_prob.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Sites */}
            <section className="space-y-2">
              <h3 className="text-sm font-medium text-black/80">Sites</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2 text-black/70">
                  <Label
                    htmlFor="urban_sites_per_km2"
                    className="ml-0.5 text-xs"
                  >
                    Urban Sites (per km²)
                  </Label>
                  <Input
                    id="urban_sites_per_km2"
                    type="number"
                    min={0}
                    step={0.1}
                    value={params.urban_sites_per_km2}
                    onChange={(e) =>
                      setNumber(
                        'urban_sites_per_km2',
                        Math.max(0, Number(e.target.value) || 0),
                      )
                    }
                  />
                </div>
                <div className="space-y-2 text-black/70">
                  <Label
                    htmlFor="rural_sites_per_km2"
                    className="ml-0.5 text-xs"
                  >
                    Rural Sites (per km²)
                  </Label>
                  <Input
                    id="rural_sites_per_km2"
                    type="number"
                    min={0}
                    step={0.1}
                    value={params.rural_sites_per_km2}
                    onChange={(e) =>
                      setNumber(
                        'rural_sites_per_km2',
                        Math.max(0, Number(e.target.value) || 0),
                      )
                    }
                  />
                </div>
              </div>
            </section>

            {/* Activity Rates */}
            <section className="space-y-2">
              <h3 className="text-sm font-medium text-black/80">
                Activity Rates (packages/hour)
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2 text-black/70">
                  <Label
                    htmlFor="urban_activity_rate_min"
                    className="ml-0.5 text-xs"
                  >
                    Urban Range [min, max]
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      id="urban_activity_rate_min"
                      type="number"
                      min={0}
                      step={0.1}
                      value={params.urban_activity_rate_range[0]}
                      onChange={(e) =>
                        setArrayRange(
                          'urban_activity_rate_range',
                          0,
                          Number(e.target.value) || 0,
                        )
                      }
                      placeholder="Min"
                    />
                    <Input
                      id="urban_activity_rate_max"
                      type="number"
                      min={0}
                      step={0.1}
                      value={params.urban_activity_rate_range[1]}
                      onChange={(e) =>
                        setArrayRange(
                          'urban_activity_rate_range',
                          1,
                          Number(e.target.value) || 0,
                        )
                      }
                      placeholder="Max"
                    />
                  </div>
                </div>
                <div className="space-y-2 text-black/70">
                  <Label
                    htmlFor="rural_activity_rate_min"
                    className="ml-0.5 text-xs"
                  >
                    Rural Range [min, max]
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      id="rural_activity_rate_min"
                      type="number"
                      min={0}
                      step={0.1}
                      value={params.rural_activity_rate_range[0]}
                      onChange={(e) =>
                        setArrayRange(
                          'rural_activity_rate_range',
                          0,
                          Number(e.target.value) || 0,
                        )
                      }
                      placeholder="Min"
                    />
                    <Input
                      id="rural_activity_rate_max"
                      type="number"
                      min={0}
                      step={0.1}
                      value={params.rural_activity_rate_range[1]}
                      onChange={(e) =>
                        setArrayRange(
                          'rural_activity_rate_range',
                          1,
                          Number(e.target.value) || 0,
                        )
                      }
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Seed */}
            <section className="space-y-2">
              <h3 className="text-sm font-medium text-black/80">Randomness</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2 text-black/70">
                  <Label htmlFor="seed" className="ml-0.5 text-xs">
                    Seed
                  </Label>
                  <Input
                    id="seed"
                    type="number"
                    step={1}
                    value={params.seed}
                    onChange={(e) =>
                      setNumber('seed', Math.floor(Number(e.target.value) || 0))
                    }
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
        <div className="flex-1 rounded-xl border border-dashed border-black/70" />
      </div>
    </HudContainer>
  );
}
