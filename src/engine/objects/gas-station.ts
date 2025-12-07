import * as THREE from 'three';
import { Colors } from '@/app/colors';

export function createGasStation(): THREE.Group {
  const gasStation = new THREE.Group();
  gasStation.name = 'GasStation';

  // --- Dimensions ---
  const baseWidth = 18;
  const baseDepth = 12;
  const baseHeight = 0.1;

  const storeWidth = 8;
  const storeDepth = 6;
  const storeHeight = 3.5;

  const canopyWidth = 16;
  const canopyDepth = 8;
  const canopyThickness = 0.2;
  const canopyHeight = 4.5; // Height of canopy top from ground

  const pumpCount = 4;
  const pumpWidth = 0.8;
  const pumpDepth = 0.6;
  const pumpHeight = 1.2;

  // --- Materials ---
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: Colors.parkingBase,
    flatShading: true,
    roughness: 0.9,
    metalness: 0,
  });

  const storeWallMaterial = new THREE.MeshStandardMaterial({
    color: Colors.warehouseWall,
    flatShading: true,
    roughness: 0.8,
    metalness: 0,
  });

  const storeRoofMaterial = new THREE.MeshStandardMaterial({
    color: Colors.warehouseRoof,
    flatShading: true,
    roughness: 0.9,
    metalness: 0,
  });

  const canopyMaterial = new THREE.MeshStandardMaterial({
    color: Colors.gasStationCanopy,
    flatShading: true,
    roughness: 0.8,
    metalness: 0,
  });

  const columnMaterial = new THREE.MeshStandardMaterial({
    color: Colors.gasStationCanopy,
    flatShading: true,
    roughness: 0.7,
    metalness: 0,
  });

  const pumpMaterial = new THREE.MeshStandardMaterial({
    color: Colors.gasStationPump,
    flatShading: true,
    roughness: 0.6,
    metalness: 0,
  });

  const pumpScreenMaterial = new THREE.MeshStandardMaterial({
    color: 0x2c3e50, // dark grey for screen
    flatShading: true,
    roughness: 0.3,
    metalness: 0.2,
  });

  const signMaterial = new THREE.MeshStandardMaterial({
    color: Colors.gasStationSign,
    flatShading: true,
    roughness: 0.7,
    metalness: 0,
  });

  const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0x87ceeb, // light blue for windows
    flatShading: true,
    roughness: 0.2,
    metalness: 0.1,
  });

  const lightMaterial = new THREE.MeshStandardMaterial({
    color: Colors.lightPoint,
    flatShading: true,
    roughness: 0.3,
    metalness: 0.1,
    emissive: Colors.lightPoint,
    emissiveIntensity: 0.3,
  });

  // --- 1. Base/Platform ---
  const baseGeo = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
  const base = new THREE.Mesh(baseGeo, baseMaterial);
  base.position.y = baseHeight / 2;
  base.receiveShadow = true;
  base.castShadow = true;
  gasStation.add(base);

  // --- 2. Convenience Store Building ---
  const storeGroup = new THREE.Group();

  // Main building structure
  const storeGeo = new THREE.BoxGeometry(storeWidth, storeHeight, storeDepth);
  const store = new THREE.Mesh(storeGeo, storeWallMaterial);
  store.position.y = storeHeight / 2;
  store.castShadow = true;
  store.receiveShadow = true;
  storeGroup.add(store);

  // Roof
  const roofGeo = new THREE.BoxGeometry(
    storeWidth + 0.4,
    0.3,
    storeDepth + 0.4,
  );
  const roof = new THREE.Mesh(roofGeo, storeRoofMaterial);
  roof.position.y = storeHeight + 0.15;
  roof.castShadow = true;
  storeGroup.add(roof);

  // Windows (simple boxes)
  const windowWidth = 1.2;
  const windowHeight = 1.5;
  const windowDepth = 0.1;
  const windowGeo = new THREE.BoxGeometry(windowWidth, windowHeight, windowDepth);

  // Front windows (2 windows)
  for (let i = 0; i < 2; i++) {
    const window = new THREE.Mesh(windowGeo, windowMaterial);
    window.position.set(
      (i - 0.5) * 2.5, // Spaced apart
      2.0, // Mid-height
      storeDepth / 2 + 0.05, // Slightly in front of wall
    );
    storeGroup.add(window);
  }

  // Position store at back of lot
  storeGroup.position.z = -(baseDepth / 2) + storeDepth / 2 + 1;
  gasStation.add(storeGroup);

  // --- 3. Canopy Structure ---
  const canopyGroup = new THREE.Group();

  // Canopy top
  const canopyTopGeo = new THREE.BoxGeometry(
    canopyWidth,
    canopyThickness,
    canopyDepth,
  );
  const canopyTop = new THREE.Mesh(canopyTopGeo, canopyMaterial);
  canopyTop.position.y = canopyHeight;
  canopyTop.castShadow = true;
  canopyTop.receiveShadow = true;
  canopyGroup.add(canopyTop);

  // Support columns (6 columns: 2 rows of 3)
  const columnRadius = 0.15;
  const columnHeight = canopyHeight;
  const columnGeo = new THREE.CylinderGeometry(
    columnRadius,
    columnRadius,
    columnHeight,
    8,
  );

  const columnPositions = [
    { x: -canopyWidth / 2 + 2, z: -canopyDepth / 2 + 1.5 }, // Front left
    { x: 0, z: -canopyDepth / 2 + 1.5 }, // Front center
    { x: canopyWidth / 2 - 2, z: -canopyDepth / 2 + 1.5 }, // Front right
    { x: -canopyWidth / 2 + 2, z: canopyDepth / 2 - 1.5 }, // Back left
    { x: 0, z: canopyDepth / 2 - 1.5 }, // Back center
    { x: canopyWidth / 2 - 2, z: canopyDepth / 2 - 1.5 }, // Back right
  ];

  columnPositions.forEach((pos) => {
    const column = new THREE.Mesh(columnGeo, columnMaterial);
    column.position.set(pos.x, columnHeight / 2, pos.z);
    column.castShadow = true;
    column.receiveShadow = true;
    canopyGroup.add(column);
  });

  // Position canopy in front of store
  canopyGroup.position.z = -(baseDepth / 2) + canopyDepth / 2 + 2;
  gasStation.add(canopyGroup);

  // --- 4. Gas Pumps ---
  const pumpSpacing = 3.0;
  const pumpStartX = -((pumpCount - 1) * pumpSpacing) / 2;

  for (let i = 0; i < pumpCount; i++) {
    const pumpGroup = new THREE.Group();
    const pumpX = pumpStartX + i * pumpSpacing;

    // Main pump body
    const pumpBodyGeo = new THREE.BoxGeometry(pumpWidth, pumpHeight, pumpDepth);
    const pumpBody = new THREE.Mesh(pumpBodyGeo, pumpMaterial);
    pumpBody.position.y = pumpHeight / 2;
    pumpBody.castShadow = true;
    pumpBody.receiveShadow = true;
    pumpGroup.add(pumpBody);

    // Display screen (on top front)
    const screenGeo = new THREE.BoxGeometry(pumpWidth * 0.7, 0.2, 0.15);
    const screen = new THREE.Mesh(screenGeo, pumpScreenMaterial);
    screen.position.set(0, pumpHeight - 0.1, pumpDepth / 2 + 0.075);
    pumpGroup.add(screen);

    // Hose/nozzle (simple cylinder)
    const hoseGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 6);
    const hose = new THREE.Mesh(hoseGeo, pumpMaterial);
    hose.rotation.z = Math.PI / 2;
    hose.position.set(pumpWidth / 2 + 0.2, pumpHeight * 0.4, 0);
    pumpGroup.add(hose);

    // Position pump under canopy
    pumpGroup.position.set(
      pumpX,
      0,
      -(baseDepth / 2) + canopyDepth / 2 + 1.5,
    );
    gasStation.add(pumpGroup);
  }

  // --- 5. Signage ---
  // Building-mounted sign
  const signWidth = 6;
  const signHeight = 1.2;
  const signDepth = 0.2;
  const signGeo = new THREE.BoxGeometry(signWidth, signHeight, signDepth);
  const sign = new THREE.Mesh(signGeo, signMaterial);
  sign.position.set(0, storeHeight + 0.6, storeDepth / 2 + 0.1);
  sign.castShadow = true;
  storeGroup.add(sign);

  // --- 6. Lights ---
  // Decorative lights under canopy (small boxes)
  const lightSize = 0.3;
  const lightGeo = new THREE.BoxGeometry(lightSize, lightSize, lightSize);

  const lightPositions = [
    { x: -canopyWidth / 2 + 1, z: -canopyDepth / 2 + 0.5 },
    { x: canopyWidth / 2 - 1, z: -canopyDepth / 2 + 0.5 },
    { x: -canopyWidth / 2 + 1, z: canopyDepth / 2 - 0.5 },
    { x: canopyWidth / 2 - 1, z: canopyDepth / 2 - 0.5 },
  ];

  lightPositions.forEach((pos) => {
    const light = new THREE.Mesh(lightGeo, lightMaterial);
    light.position.set(
      pos.x,
      canopyHeight - 0.3,
      pos.z + -(baseDepth / 2) + canopyDepth / 2 + 2,
    );
    gasStation.add(light);
  });

  return gasStation;
}

