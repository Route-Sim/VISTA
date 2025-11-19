import * as THREE from 'three';
import { Colors } from '@/app/colors';

// Dimensions for small truck / car spots
export const PARKING_SPOT_WIDTH = 2.4;
export const PARKING_SPOT_DEPTH = 5.0;
export const PARKING_CORRIDOR_WIDTH = 3.0; // Central driveway
export const PARKING_BASE_HEIGHT = 0.1;

export type ParkingOptions = {
  spots?: number; // Total spots (will be divided into 2 rows)
};

export function createParkingLot(options: ParkingOptions = {}): THREE.Group {
  const { spots = 20 } = options; // Default to ~20 spots for a 3:2 aspect ratio block
  const spotsPerRow = Math.ceil(spots / 2);

  const group = new THREE.Group();

  // Dimensions
  const totalWidth = spotsPerRow * PARKING_SPOT_WIDTH;
  const totalDepth = PARKING_SPOT_DEPTH * 2 + PARKING_CORRIDOR_WIDTH;

  // 1. Base (Asphalt)
  const baseGeometry = new THREE.BoxGeometry(
    totalWidth,
    PARKING_BASE_HEIGHT,
    totalDepth,
  );
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: Colors.parkingBase,
    flatShading: true,
    roughness: 0.9,
    metalness: 0,
  });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.receiveShadow = true;
  base.castShadow = true;
  base.position.y = PARKING_BASE_HEIGHT / 2;
  group.add(base);

  // 2. Spot Dividers
  const lineWidth = 0.15;
  const lineHeight = 0.02;
  const lineDepth = PARKING_SPOT_DEPTH * 0.9; // Slightly shorter than the spot

  const lineGeometry = new THREE.BoxGeometry(lineWidth, lineHeight, lineDepth);
  const lineMaterial = new THREE.MeshStandardMaterial({
    color: Colors.parkingLine,
    flatShading: true,
    roughness: 1.0,
    metalness: 0,
  });

  // Generate two rows
  // Row 1: Top (negative Z relative to center, or positive? Let's say -Z is "top" in view)
  // We place rows at +/- Z offsets
  const zOffset = PARKING_CORRIDOR_WIDTH / 2 + PARKING_SPOT_DEPTH / 2;

  const createRow = (zPos: number) => {
    for (let i = 0; i <= spotsPerRow; i++) {
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      // Start left, move right
      const x = -totalWidth / 2 + i * PARKING_SPOT_WIDTH;

      line.position.set(x, PARKING_BASE_HEIGHT + lineHeight / 2, zPos);
      line.receiveShadow = true;
      group.add(line);
    }
  };

  // Row 1 (Back/North)
  createRow(-zOffset);

  // Row 2 (Front/South)
  createRow(zOffset);

  group.name = 'ParkingLot';
  return group;
}
