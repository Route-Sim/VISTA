import * as THREE from 'three';

import type { SimStore } from '@/sim';
import { interpolateSnapshots } from '@/sim/systems/interpolation';
import { GraphView } from '@/view/graph/graph-view';

export interface ViewController {
  update(renderTimeMs: number): void;
  dispose(): void;
}

export interface CreateViewControllerOptions {
  store: SimStore;
  scene: THREE.Scene;
}

export function createViewController(
  options: CreateViewControllerOptions,
): ViewController {
  const { store, scene } = options;
  const buffer = store.getBuffer();
  const graphView = new GraphView(scene);

  return {
    update(renderTimeMs: number): void {
      const bracket = buffer.getBracketing(renderTimeMs);
      if (!bracket) return;
      const frame = interpolateSnapshots(bracket.a, bracket.b, bracket.alpha);
      graphView.update(frame);
    },
    dispose(): void {
      graphView.dispose();
    },
  };
}
