import { Engine } from './engine/engine';
import { SceneManager } from './engine/scene-manager';
import { createCamera } from './engine/camera-rig';
import { createOrbitMoveControls } from './engine/controls/orbit-move-controls';
import { mountHud } from './hud';
import { net } from '@/net';
import { SimStore, wireNetToSim } from '@/sim';

const canvas = document.createElement('canvas');
canvas.id = 'app';
document.body.appendChild(canvas);

const engine = new Engine(canvas);
const scenes = new SceneManager();
const camera = createCamera(canvas);
const controls = createOrbitMoveControls(camera, canvas, {
  movementSpeed: 8,
  minY: 5,
});

// Mount HUD
const hud = mountHud();

// Toggle HUD with H key
window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  if (key === 'h') {
    hud.toggle();
  }
});

const simStore = new SimStore();
// Wire net → sim using a single adapter
wireNetToSim(net, simStore);

engine.onUpdate((t) => {
  controls.update(t.deltaTimeMs / 1000);
  engine.gl.render(scenes.scene, camera);
});

engine.start();
