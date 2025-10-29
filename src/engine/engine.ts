import * as THREE from 'three';

export type EngineTime = {
  elapsedTimeMs: number;
  deltaTimeMs: number;
  renderTimeMs: number;
};

export class Engine {
  private renderer: THREE.WebGLRenderer;
  private started = false;
  private lastMs = 0;
  private onUpdateCallbacks: Array<(t: EngineTime) => void> = [];
  public readonly clock = new THREE.Clock();

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  get gl(): THREE.WebGLRenderer {
    return this.renderer;
  }

  onUpdate(cb: (t: EngineTime) => void) {
    this.onUpdateCallbacks.push(cb);
  }

  start() {
    if (this.started) return;
    this.started = true;
    this.lastMs = performance.now();
    const loop = () => {
      if (!this.started) return;
      const now = performance.now();
      const delta = now - this.lastMs;
      this.lastMs = now;
      const time: EngineTime = {
        elapsedTimeMs: this.clock.getElapsedTime() * 1000,
        deltaTimeMs: delta,
        renderTimeMs: now,
      };
      for (const cb of this.onUpdateCallbacks) cb(time);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  stop() {
    this.started = false;
  }
}
