export type ColorHex = number;

// Centralized application color palette
// Keep domain independent; use only primitive types here
export const Colors = {
  // Backgrounds
  background: 0xf2f2f2 as ColorHex, // warm peachy sky
  fog: 0xf2f2f2 as ColorHex,

  // Ground
  ground: 0x4da167 as ColorHex, // sand / dry grass tone

  // Graph primitives
  graphNode: 0xffb36b as ColorHex,
  graphRoad: 0x5f4b32 as ColorHex,

  // Lights
  lightAmbient: 0xffe8cc as ColorHex, // warm cream
  lightPoint: 0xff9b5e as ColorHex, // sunset orange key
} as const;

export type AppColorKey = keyof typeof Colors;

export function getColor(key: AppColorKey): ColorHex {
  return Colors[key];
}
