import * as THREE from "three";
import {
  type ConnectorMask,
  DIR_E,
  DIR_N,
  DIR_S,
  DIR_W,
  rotateMask,
} from "./connectors";
import { computeRoadDimensions } from "./common";
import { createTile } from "./tiles/factory";
import {
  DEFAULT_TILE_SIZE,
  type GridSize,
  type RoadStyle,
  type RoadStyleInput,
  type TileSpec,
} from "./tiles/types";

export type BuilderConfig = GridSize & {
  tileSize?: number;
  debugBorders?: boolean;
} & RoadStyleInput;

type Cell = TileSpec | null;

export class RoadMapBuilder {
  private readonly width: number;
  private readonly height: number;
  private readonly tileSize: number;
  private readonly grid: Cell[];
  private readonly style: RoadStyle;
  private readonly debugBorders: boolean;

  private constructor(cfg: BuilderConfig) {
    this.width = cfg.width;
    this.height = cfg.height;
    this.tileSize = cfg.tileSize ?? DEFAULT_TILE_SIZE;
    this.debugBorders = cfg.debugBorders ?? false;
    const dims = computeRoadDimensions({
      lanesPerDirection: cfg.lanesPerDirection ?? 1,
      laneWidth: cfg.laneWidth ?? 3.2,
      shoulderWidth: cfg.shoulderWidth ?? 0.6,
    });
    this.style = {
      lanesPerDirection: cfg.lanesPerDirection ?? 1,
      laneWidth: cfg.laneWidth ?? 3.2,
      shoulderWidth: cfg.shoulderWidth ?? 0.6,
      dashedCenter: cfg.dashedCenter ?? true,
      totalWidth: dims.totalWidth,
      carriageWidth: dims.carriageWidth,
    };
    this.grid = new Array(this.width * this.height).fill(null);
  }

  static create(cfg: BuilderConfig): RoadMapBuilder {
    return new RoadMapBuilder(cfg);
  }

  private index(x: number, y: number): number {
    return y * this.width + x;
  }

  tile(x: number, y: number, spec: TileSpec): RoadMapBuilder {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return this;
    this.grid[this.index(x, y)] = spec;
    return this;
  }

  straight(
    x: number,
    y: number,
    rotation: 0 | 90 | 180 | 270 = 0
  ): RoadMapBuilder {
    return this.tile(x, y, { kind: "straight", rotation });
  }

  turn(x: number, y: number, rotation: 0 | 90 | 180 | 270 = 0): RoadMapBuilder {
    return this.tile(x, y, { kind: "turn", rotation });
  }

  validate(): string[] {
    const issues: string[] = [];
    // Connectivity masks per kind in default orientation (0°): straight connects W<->E, turn connects E<->S
    const baseMasks: Record<string, ConnectorMask> = {
      straight: (1 << DIR_W) | (1 << DIR_E),
      turn: (1 << DIR_E) | (1 << DIR_S),
    };
    const rotationToTurns: Record<0 | 90 | 180 | 270, number> = {
      0: 0,
      90: 1,
      180: 2,
      270: 3,
    };
    const getMask = (spec: TileSpec | null): ConnectorMask => {
      if (!spec || spec.kind === "empty") return 0;
      const base = baseMasks[spec.kind] ?? 0;
      const turns = rotationToTurns[spec.rotation as 0 | 90 | 180 | 270] ?? 0;
      return rotateMask(base, turns);
    };

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const a = this.grid[this.index(x, y)];
        if (!a || a.kind === "empty") continue;
        const am = getMask(a);
        // check east neighbor
        if (x + 1 < this.width) {
          const b = this.grid[this.index(x + 1, y)];
          const bm = getMask(b);
          const ae = (am >> DIR_E) & 1;
          const bw = (bm >> DIR_W) & 1;
          if (ae ^ bw)
            issues.push(`Mismatch at (${x},${y}) E↔(${x + 1},${y}) W`);
        }
        // check south neighbor
        if (y + 1 < this.height) {
          const b = this.grid[this.index(x, y + 1)];
          const bm = getMask(b);
          const as = (am >> DIR_S) & 1;
          const bn = (bm >> DIR_N) & 1;
          if (as ^ bn)
            issues.push(`Mismatch at (${x},${y}) S↔(${x},${y + 1}) N`);
        }
      }
    }

    return issues;
  }

  build(): THREE.Group {
    const issues = this.validate();
    if (issues.length > 0) {
      // eslint-disable-next-line no-console
      console.warn("RoadMapBuilder validation issues:", issues);
    }

    const root = new THREE.Group();
    root.name = "roads-tiled";

    const ctx = { tileSize: this.tileSize, style: this.style };
    const half = this.tileSize / 2;
    const borderGeom: THREE.BufferGeometry | null = this.debugBorders
      ? (() => {
          const g = new THREE.BufferGeometry();
          const y = 0.01;
          const verts = new Float32Array([
            -half,
            y,
            -half,
            half,
            y,
            -half,
            half,
            y,
            half,
            -half,
            y,
            half,
          ]);
          g.setAttribute("position", new THREE.BufferAttribute(verts, 3));
          return g;
        })()
      : null;
    const borderMat = this.debugBorders
      ? new THREE.LineBasicMaterial({ color: 0xff0000 })
      : null;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const spec = this.grid[this.index(x, y)];
        if (!spec || spec.kind === "empty") continue;
        const tile = createTile(spec, ctx);
        // Position tile center in world space: origin at grid center
        const ox = -((this.width - 1) * this.tileSize) / 2;
        const oz = -((this.height - 1) * this.tileSize) / 2;
        tile.position.set(ox + x * this.tileSize, 0, oz + y * this.tileSize);
        root.add(tile);

        if (this.debugBorders && borderGeom && borderMat) {
          const border = new THREE.LineLoop(borderGeom, borderMat);
          border.position.copy(tile.position);
          root.add(border);
        }
      }
    }

    // Optionally also draw borders for empty cells to verify grid alignment
    if (this.debugBorders && borderGeom && borderMat) {
      const ox = -((this.width - 1) * this.tileSize) / 2;
      const oz = -((this.height - 1) * this.tileSize) / 2;
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const spec = this.grid[this.index(x, y)];
          if (spec && spec.kind !== "empty") continue;
          const border = new THREE.LineLoop(borderGeom, borderMat);
          border.position.set(
            ox + x * this.tileSize,
            0,
            oz + y * this.tileSize
          );
          root.add(border);
        }
      }
    }

    return root;
  }
}
