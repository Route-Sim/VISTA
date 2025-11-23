import * as THREE from 'three';
import { focusStore, type FocusType } from '@/hud/state/focus-state';

export class InteractionManager {
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private camera: THREE.Camera;
  private scene: THREE.Scene;
  private canvas: HTMLCanvasElement;
  private isDragging = false;
  private startX = 0;
  private startY = 0;

  constructor(
    camera: THREE.Camera,
    scene: THREE.Scene,
    canvas: HTMLCanvasElement,
  ) {
    this.camera = camera;
    this.scene = scene;
    this.canvas = canvas;
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointerup', this.onPointerUp);
    this.canvas.addEventListener('pointermove', this.onPointerMove);
  }

  private onPointerDown = (event: PointerEvent) => {
    this.isDragging = false;
    this.startX = event.clientX;
    this.startY = event.clientY;
  };

  private onPointerMove = (event: PointerEvent) => {
    if (
      Math.abs(event.clientX - this.startX) > 5 ||
      Math.abs(event.clientY - this.startY) > 5
    ) {
      this.isDragging = true;
    }
  };

  private onPointerUp = (event: PointerEvent) => {
    if (this.isDragging) return;

    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(
      this.scene.children,
      true,
    );

    for (const intersect of intersects) {
      let obj: THREE.Object3D | null = intersect.object;
      while (obj) {
        if (obj.userData && obj.userData.id && obj.userData.type) {
          const worldPos = new THREE.Vector3();
          obj.getWorldPosition(worldPos);
          focusStore.setFocus(
            obj.userData.id,
            obj.userData.type as FocusType,
            worldPos,
          );
          return;
        }
        obj = obj.parent;
      }
    }
  };

  dispose() {
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('pointerup', this.onPointerUp);
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
  }
}
