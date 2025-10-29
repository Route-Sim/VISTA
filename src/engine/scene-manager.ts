import * as THREE from 'three';

import { createGround } from '@/engine/objects/ground';
import { Colors } from '@/app/colors';

export class SceneManager {
  public readonly scene: THREE.Scene;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(Colors.background);
    this.scene.fog = new THREE.Fog(Colors.fog, 60, 100);

    const ambient = new THREE.AmbientLight(Colors.lightAmbient, 0.9);
    this.scene.add(ambient);

    const point = new THREE.PointLight(Colors.lightPoint, 1.0, 0, 2);
    point.position.set(20, 20, 20);
    this.scene.add(point);

    const ground = createGround({ width: 500, height: 500 });
    this.scene.add(ground);
  }
}
