import * as THREE from 'three';
import { Colors } from '@/app/colors';

export function createTruckMesh(): THREE.Group {
  const truck = new THREE.Group();

  // Materials
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: Colors.truckBody,
    flatShading: true,
    roughness: 0.7,
  });
  const cabinMaterial = new THREE.MeshStandardMaterial({
    color: Colors.truckCabin,
    flatShading: true,
    roughness: 0.5,
  });
  const wheelMaterial = new THREE.MeshStandardMaterial({
    color: Colors.truckWheel,
    flatShading: true,
    roughness: 0.9,
  });
  const containerMaterial = new THREE.MeshStandardMaterial({
    color: Colors.truckContainer,
    flatShading: true,
    roughness: 0.6,
  });

  // Chassis
  const chassisGeo = new THREE.BoxGeometry(2, 0.5, 4);
  const chassis = new THREE.Mesh(chassisGeo, bodyMaterial);
  chassis.position.y = 0.8; // Wheel radius (0.4) + half chassis height (0.25) + clearance (0.15)
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  truck.add(chassis);

  // Cabin
  const cabinGeo = new THREE.BoxGeometry(1.9, 1.5, 1.5);
  const cabin = new THREE.Mesh(cabinGeo, cabinMaterial);
  cabin.position.y = 1.55; // Chassis top (0.8 + 0.25) + half cabin height (0.75) - overlap (0.25)
  cabin.position.z = 1.2; // Front of chassis (moved back slightly to avoid z-fighting with chassis front)
  cabin.castShadow = true;
  cabin.receiveShadow = true;
  truck.add(cabin);

  // Container
  const containerGeo = new THREE.BoxGeometry(1.95, 2.2, 3.5);
  const container = new THREE.Mesh(containerGeo, containerMaterial);
  container.position.y = 1.9; // Chassis top (0.8 + 0.25) + half container height (1.1) - overlap (0.25)
  container.position.z = -1.0; // Back of chassis
  container.castShadow = true;
  container.receiveShadow = true;
  truck.add(container);

  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
  wheelGeo.rotateZ(Math.PI / 2);

  const wheelPositions = [
    { x: -1.1, z: -1.2 }, // Rear Left
    { x: 1.1, z: -1.2 },  // Rear Right
    { x: -1.1, z: 1.2 },  // Front Left
    { x: 1.1, z: 1.2 },   // Front Right
  ];

  wheelPositions.forEach((pos) => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMaterial);
    wheel.position.set(pos.x, 0.4, pos.z);
    wheel.castShadow = true;
    wheel.receiveShadow = true;
    truck.add(wheel);
  });

  truck.name = 'Truck';
  return truck;
}
