export type ColorHex = number;

// Centralized application color palette
// Keep domain independent; use only primitive types here
export const Colors = {
  // Backgrounds
  background: 0xfffcf7 as ColorHex, // warm peachy sky
  fog: 0xfffcf7 as ColorHex,

  // Ground
  ground: 0x77966d as ColorHex, // sand / dry grass tone

  // Graph primitives
  graphNode: 0x5e5b52 as ColorHex, // silver / light gray
  graphRoad: 0x5e5b52 as ColorHex,

  // Lights
  lightAmbient: 0xfffcf7 as ColorHex, // warm cream
  lightPoint: 0xee7b30 as ColorHex, // sunset orange key

  // Truck
  truckBody: 0x3498db as ColorHex, // blue
  truckCabin: 0xffffff as ColorHex, // white
  truckWheel: 0x2c3e50 as ColorHex, // dark grey
  truckContainer: 0xd35400 as ColorHex, // pumpkin orange
} as const;

export type AppColorKey = keyof typeof Colors;

export function getColor(key: AppColorKey): ColorHex {
  return Colors[key];
}
