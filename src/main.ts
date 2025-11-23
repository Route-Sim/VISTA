import { Engine } from './engine/engine';
import { SceneManager } from './engine/scene-manager';
import { createCamera } from './engine/camera-rig';
import { createOrbitMoveControls } from './engine/controls/orbit-move-controls';
import { CameraManager } from './engine/camera-manager';
import { mountHud } from './hud';
import { net } from '@/net';
import { SimStore, wireNetToSim } from '@/sim';
import { createViewController } from '@/view';
import { InteractionManager } from './engine/interaction';

const canvas = document.createElement('canvas');
canvas.id = 'app';
document.body.appendChild(canvas);

const engine = new Engine(canvas);
const scenes = new SceneManager();
const camera = createCamera(canvas);

// Initialize SimStore first as it is needed for CameraManager
const simStore = new SimStore();

// Create controls
// We reuse the OrbitControls instance created inside orbitMoveControls
const orbitMoveControls = createOrbitMoveControls(camera, canvas, {
  movementSpeed: 12,
  minY: 3,
});
const orbitControls = orbitMoveControls.controls;

// Create CameraManager
const cameraManager = new CameraManager(
  camera,
  orbitControls,
  orbitMoveControls,
  simStore,
);

// Initialize InteractionManager
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const interaction = new InteractionManager(camera, scenes.scene, canvas);

// Mount HUD
const hud = mountHud();

// Toggle HUD with H key
window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  if (key === 'h') {
    hud.toggle();
  }
});

// Wire net → sim using a single adapter
wireNetToSim(net, simStore);

const view = createViewController({ store: simStore, scene: scenes.scene });

engine.onUpdate((t) => {
  cameraManager.update(t.deltaTimeMs / 1000);
  view.update(t.renderTimeMs);
  engine.gl.render(scenes.scene, camera);
});

engine.start();
