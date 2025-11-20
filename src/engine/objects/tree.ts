import * as THREE from 'three';
import { Colors } from '@/app/colors';

export interface TreeOptions {
  height?: number;
  foliageScale?: number;
}

const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.4, 1, 7);
trunkGeometry.translate(0, 0.5, 0); // Pivot at bottom

const foliageGeometry = new THREE.IcosahedronGeometry(1, 0); // Low poly sphere

const trunkMaterial = new THREE.MeshStandardMaterial({
  color: Colors.treeTrunk,
  flatShading: true,
  roughness: 0.9,
  metalness: 0,
});

const foliageMaterial = new THREE.MeshStandardMaterial({
  color: Colors.treeFoliage,
  flatShading: true,
  roughness: 0.8,
  metalness: 0,
});

export function createTree(options: TreeOptions = {}): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Tree';

  const height = options.height ?? 2.5 + Math.random() * 1.5; // 2.5m - 4.0m
  const foliageScale = options.foliageScale ?? 1.0 + Math.random() * 0.4;

  // 1. Trunk
  const trunkHeight = height * 0.4;
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.scale.set(1, trunkHeight, 1);
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  group.add(trunk);

  // 2. Foliage Clumps
  // We'll create 2-3 overlapping clumps for a fluffy look
  const clumpCount = 2 + Math.floor(Math.random() * 2);

  for (let i = 0; i < clumpCount; i++) {
    const clump = new THREE.Mesh(foliageGeometry, foliageMaterial);

    // Scale decreases slightly as we go up
    const levelScale = foliageScale * (1.0 - i * 0.15);
    clump.scale.setScalar(levelScale);

    // Position: stack them up, with random horizontal offset
    const yPos = trunkHeight * 0.8 + (i * (height - trunkHeight)) / clumpCount;
    const xOffset = (Math.random() - 0.5) * 0.5;
    const zOffset = (Math.random() - 0.5) * 0.5;

    clump.position.set(xOffset, yPos, zOffset);

    // Random rotation for faceted variety
    clump.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI,
    );

    clump.castShadow = true;
    clump.receiveShadow = true;
    group.add(clump);
  }

  return group;
}
