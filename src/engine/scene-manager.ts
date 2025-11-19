import * as THREE from 'three';

import { createGround } from '@/engine/objects/ground';
import { createTruckMesh } from '@/engine/objects/truck';
import { createDeliverySite } from '@/engine/objects/delivery-site';
import { createParkingLot } from '@/engine/objects/parking';
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
    point.castShadow = true;
    point.shadow.mapSize.width = 2048;
    point.shadow.mapSize.height = 2048;
    this.scene.add(point);

    const ground = createGround({ width: 500, height: 500 });
    this.scene.add(ground);

    // --- Delivery Site ---
    const deliverySite = createDeliverySite();
    deliverySite.position.set(40, 0, 0); // Shift back slightly
    this.scene.add(deliverySite);

    // --- Trucks ---
    const truck1 = createTruckMesh();
    truck1.position.set(10, 0, 0);
    truck1.rotation.y = Math.PI;
    this.scene.add(truck1);

    const truck2 = createTruckMesh();
    truck2.position.set(15, 0, 0);
    truck2.rotation.y = Math.PI * 1.2;
    this.scene.add(truck2);

    // --- Parking ---
    const parking = createParkingLot({ spots: 12 });
    parking.position.set(-10, 0, 0);
    this.scene.add(parking);
  }
}
