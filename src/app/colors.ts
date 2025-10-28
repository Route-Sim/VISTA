export type ColorHex = number;

// Centralized application color palette
// Keep domain independent; use only primitive types here
export const Colors = {
  // Backgrounds
  background: 0xf2f2f2 as ColorHex, // warm peachy sky
  fog: 0xf2f2f2 as ColorHex,

  // Ground
  ground: 0x4da167 as ColorHex, // sand / dry grass tone

  // Water / Lakes
  water: 0x44a5c5 as ColorHex, // desaturated teal

  // Vegetation / Trees
  foliage: 0x7fb069 as ColorHex, // muted warm olive green
  trunk: 0x8e6e53 as ColorHex, // warm mid-brown bark

  // Roads
  roadAsphalt: 0x4a4a48 as ColorHex, // warm, slightly desaturated asphalt
  roadLineWhite: 0xf7f6f2 as ColorHex, // warm off-white for markings

  // Lights
  lightAmbient: 0xffe8cc as ColorHex, // warm cream
  lightPoint: 0xff9b5e as ColorHex, // sunset orange key
} as const;

export type AppColorKey = keyof typeof Colors;

export function getColor(key: AppColorKey): ColorHex {
  return Colors[key];
}
