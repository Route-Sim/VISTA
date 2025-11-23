import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export type OrbitMoveController = {
  update(deltaSeconds: number): void;
  controls: OrbitControls;
};

type KeyState = Record<string, boolean>;

export function createOrbitMoveControls(
  camera: THREE.PerspectiveCamera,
  canvas: HTMLCanvasElement,
  options: { movementSpeed?: number; minY?: number } = {},
): OrbitMoveController {
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.rotateSpeed = 0.5;
  controls.zoomSpeed = 0.5;
  controls.panSpeed = 0.8;
  controls.target.set(0, 0.5, 0);
  controls.update();

  const movementSpeed = options.movementSpeed ?? 6;
  const minY = options.minY ?? 5;

  const keys: KeyState = {};

  const handleKeyDown = (e: KeyboardEvent) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase();
    keys[k] = true;
  };
  const handleKeyUp = (e: KeyboardEvent) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase();
    keys[k] = false;
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  const up = new THREE.Vector3(0, 1, 0);
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const move = new THREE.Vector3();

  return {
    controls,
    update(deltaSeconds: number): void {
      camera.up.set(0, 1, 0);
      controls.update();

      // Compute horizontal forward/right based on camera view
      camera.getWorldDirection(forward);
      forward.y = 0;
      if (forward.lengthSq() > 0) forward.normalize();
      right.crossVectors(forward, up).normalize();

      // WASD / arrow keys (boolean OR)
      const moveForward = keys['w'] || keys['arrowup'] ? 1 : 0;
      const moveBackward = keys['s'] || keys['arrowdown'] ? 1 : 0;
      const moveLeft = keys['a'] || keys['arrowleft'] ? 1 : 0;
      const moveRight = keys['d'] || keys['arrowright'] ? 1 : 0;

      // Vertical movement: Space (up), Shift (down)
      const moveUp = keys[' '] || keys['space'] || keys['spacebar'] ? 1 : 0;
      const moveDown =
        keys['shift'] || keys['shiftleft'] || keys['shiftright'] ? 1 : 0;

      move.set(0, 0, 0);
      if (moveForward) move.add(forward);
      if (moveBackward) move.add(forward.clone().multiplyScalar(-1));
      if (moveLeft) move.add(right.clone().multiplyScalar(-1));
      if (moveRight) move.add(right);

      if (moveUp) move.y += 1;
      if (moveDown) move.y -= 1;

      if (move.lengthSq() > 0) {
        move.normalize().multiplyScalar(movementSpeed * deltaSeconds);
        // translate camera and orbit target together to preserve orbiting
        camera.position.add(move);
        controls.target.add(move);
      }

      // Floor clamp to keep camera straight and above minY
      if (camera.position.y < minY) camera.position.y = minY;
      if (controls.target.y < minY) controls.target.y = minY;
    },
  };
}
