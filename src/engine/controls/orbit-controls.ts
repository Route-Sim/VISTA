import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function createOrbitControls(
  camera: THREE.PerspectiveCamera,
  canvas: HTMLCanvasElement,
): OrbitControls {
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.rotateSpeed = 0.5;
  controls.zoomSpeed = 0.5;
  controls.panSpeed = 0.8;
  controls.target.set(0, 0.5, 0);
  controls.update();
  return controls;
}
