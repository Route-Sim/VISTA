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
  graphNode: 0x0d1f2d as ColorHex,
  graphRoad: 0x0d1f2d as ColorHex,

  // Lights
  lightAmbient: 0xfffcf7 as ColorHex, // warm cream
  lightPoint: 0xee7b30 as ColorHex, // sunset orange key
} as const;

export type AppColorKey = keyof typeof Colors;

export function getColor(key: AppColorKey): ColorHex {
  return Colors[key];
}
