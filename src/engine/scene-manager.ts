import * as THREE from 'three';

import { createGround } from '@/engine/objects/ground';
import { Colors } from '@/app/colors';

export class SceneManager {
  public readonly scene: THREE.Scene;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(Colors.background);
    this.scene.fog = new THREE.Fog(Colors.fog, 100, 300);

    const ambient = new THREE.AmbientLight(Colors.lightAmbient, 0.9);
    this.scene.add(ambient);

    const point = new THREE.PointLight(Colors.lightPoint, 1.0, 0, 2);
    point.position.set(20, 20, 20);
    point.castShadow = true;
    point.shadow.mapSize.width = 2048;
    point.shadow.mapSize.height = 2048;
    this.scene.add(point);

    const ground = createGround({ width: 5000, height: 5000 });
    this.scene.add(ground);
  }
}
