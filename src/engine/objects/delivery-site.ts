import * as THREE from 'three';
import { Colors } from '@/app/colors';

export function createDeliverySite(): THREE.Group {
  const site = new THREE.Group();
  site.name = 'DeliverySite';

  // --- Dimensions ---
  const apronWidth = 60;
  const apronDepth = 45;
  const buildingWidth = 50;
  const buildingDepth = 30;
  const buildingHeight = 8;
  const dockCount = 4;

  // --- Materials ---
  const apronMaterial = new THREE.MeshStandardMaterial({
    color: Colors.concreteApron,
    flatShading: true,
    roughness: 0.9,
    metalness: 0,
  });

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: Colors.warehouseWall,
    flatShading: true,
    roughness: 0.8,
  });

  const roofMaterial = new THREE.MeshStandardMaterial({
    color: Colors.warehouseRoof,
    flatShading: true,
    roughness: 0.9,
  });

  const accentMaterial = new THREE.MeshStandardMaterial({
    color: Colors.warehouseAccent,
    flatShading: true,
    roughness: 0.6,
  });

  const dockDoorMaterial = new THREE.MeshStandardMaterial({
    color: 0x95a5a6, // Metal grey
    flatShading: true,
    roughness: 0.4,
    metalness: 0.3,
  });

  const bumperMaterial = new THREE.MeshStandardMaterial({
    color: Colors.dockBumper,
    flatShading: true,
    roughness: 0.9,
  });

  // --- 1. Concrete Apron (Foundation) ---
  // Covers the building footprint + loading area
  const apronGeo = new THREE.BoxGeometry(apronWidth, 0.5, apronDepth);
  const apron = new THREE.Mesh(apronGeo, apronMaterial);
  apron.position.y = 0.25; // Half height
  apron.receiveShadow = true;
  site.add(apron);

  // --- 2. Warehouse Building ---
  const buildingGroup = new THREE.Group();

  // Main block
  const buildingGeo = new THREE.BoxGeometry(
    buildingWidth,
    buildingHeight,
    buildingDepth,
  );
  const building = new THREE.Mesh(buildingGeo, wallMaterial);
  building.position.y = buildingHeight / 2;
  building.castShadow = true;
  building.receiveShadow = true;
  buildingGroup.add(building);

  // Roof Rim (Parapet)
  const parapetHeight = 0.5;
  const parapetGeo = new THREE.BoxGeometry(
    buildingWidth + 0.4,
    parapetHeight,
    buildingDepth + 0.4,
  );
  const parapet = new THREE.Mesh(parapetGeo, roofMaterial);
  parapet.position.y = buildingHeight + parapetHeight / 2;
  buildingGroup.add(parapet);

  // Roof Top (slightly recessed)
  const roofTopGeo = new THREE.BoxGeometry(
    buildingWidth - 1,
    0.2,
    buildingDepth - 1,
  );
  const roofTop = new THREE.Mesh(roofTopGeo, roofMaterial);
  roofTop.position.y = buildingHeight - 0.2;
  buildingGroup.add(roofTop);

  // Roof Vents/AC Units
  const ventGeo = new THREE.BoxGeometry(2, 1.5, 2);
  const ventMat = new THREE.MeshStandardMaterial({
    color: 0xbdc3c7,
    flatShading: true,
  });
  for (let i = 0; i < 3; i++) {
    const vent = new THREE.Mesh(ventGeo, ventMat);
    vent.position.set(
      (i - 1) * 10,
      buildingHeight + 0.75,
      i % 2 === 0 ? 5 : -5,
    );
    vent.castShadow = true;
    buildingGroup.add(vent);
  }

  // Position building on the apron (back half)
  // Apron depth 40, building depth 30.
  // Let's put building at the back edge.
  buildingGroup.position.z = -(apronDepth / 2) + buildingDepth / 2 + 2;
  // Wait, apron center is 0. Back edge is -20. Front edge is +20.
  // Building center should be near -5 to leave 15 units in front.
  buildingGroup.position.z = -5;
  site.add(buildingGroup);

  // --- 3. Loading Docks ---
  // Create indentations or add bumpers/doors on the front face of the building.
  const dockWidth = 4;
  const dockHeight = 5;
  const dockSpacing = 8;

  const startX = -((dockCount - 1) * dockSpacing) / 2;

  for (let i = 0; i < dockCount; i++) {
    const xPos = startX + i * dockSpacing;
    const zPos = buildingDepth / 2; // Front face relative to building center

    const dockGroup = new THREE.Group();
    dockGroup.position.set(xPos, 0, zPos);

    // Door (Roll-up)
    const doorGeo = new THREE.BoxGeometry(dockWidth, dockHeight, 0.2);
    const door = new THREE.Mesh(doorGeo, dockDoorMaterial);
    door.position.set(0, dockHeight / 2, 0.1);
    dockGroup.add(door);

    // Seal/Frame (Accent)
    // 3 pieces (left, right, top)
    const pillarGeo = new THREE.BoxGeometry(0.5, dockHeight + 0.5, 0.5);
    const pillarL = new THREE.Mesh(pillarGeo, accentMaterial);
    pillarL.position.set(-(dockWidth / 2 + 0.25), (dockHeight + 0.5) / 2, 0.2);
    dockGroup.add(pillarL);

    const pillarR = new THREE.Mesh(pillarGeo, accentMaterial);
    pillarR.position.set(dockWidth / 2 + 0.25, (dockHeight + 0.5) / 2, 0.2);
    dockGroup.add(pillarR);

    const headerGeo = new THREE.BoxGeometry(dockWidth + 1.5, 0.5, 0.5);
    const header = new THREE.Mesh(headerGeo, accentMaterial);
    header.position.set(0, dockHeight + 0.5, 0.2);
    dockGroup.add(header);

    // Bumpers
    const bumperGeo = new THREE.BoxGeometry(0.5, 1, 0.3);
    const bumperL = new THREE.Mesh(bumperGeo, bumperMaterial);
    bumperL.position.set(-(dockWidth / 2 + 0.5), 1.5, 0.5);
    dockGroup.add(bumperL);

    const bumperR = new THREE.Mesh(bumperGeo, bumperMaterial);
    bumperR.position.set(dockWidth / 2 + 0.5, 1.5, 0.5);
    dockGroup.add(bumperR);

    // Dock Leveler (Plate on ground)
    const plateGeo = new THREE.BoxGeometry(dockWidth, 0.1, 2);
    const plate = new THREE.Mesh(
      plateGeo,
      new THREE.MeshStandardMaterial({ color: 0x34495e }),
    );
    plate.position.set(0, 0.1, 1.0); // Extends out a bit
    dockGroup.add(plate);

    buildingGroup.add(dockGroup);
  }

  // --- 4. Props (Crates & Pallets) ---
  const crateGeo = new THREE.BoxGeometry(1, 1, 1);
  const woodMat = new THREE.MeshStandardMaterial({
    color: Colors.crateWood,
    flatShading: true,
  });
  const blueMat = new THREE.MeshStandardMaterial({
    color: Colors.crateBlue,
    flatShading: true,
  });
  const redMat = new THREE.MeshStandardMaterial({
    color: Colors.crateRed,
    flatShading: true,
  });

  const createStack = (
    x: number,
    z: number,
    height: number,
    colorMat: THREE.Material,
  ) => {
    for (let h = 0; h < height; h++) {
      const crate = new THREE.Mesh(crateGeo, colorMat);
      // Random slight rotation for natural look
      const rot = (Math.random() - 0.5) * 0.2;
      crate.rotation.y = rot;
      crate.position.set(x, 0.5 + h, z);
      crate.castShadow = true;
      crate.receiveShadow = true;
      site.add(crate);
    }
  };

  // Place some stacks near the sides of the apron
  createStack(-25, 10, 2, woodMat);
  createStack(-24, 11, 1, woodMat);
  createStack(-26, 9, 3, blueMat);

  createStack(25, 8, 2, redMat);
  createStack(24, 10, 2, woodMat);

  // --- 5. Parking/Waiting Area ---
  // Removed integrated parking per request.

  site.scale.setScalar(0.375); // 0.25 * 1.5 = 0.375

  return site;
}
