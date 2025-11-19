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

  // Road Classes
  roadClassA: 0x2d3436 as ColorHex, // Motorway - Dark Slate
  roadClassS: 0x353b48 as ColorHex, // Expressway - Onyx
  roadClassGP: 0x535c68 as ColorHex, // Main Road - Charcoal
  roadClassG: 0x535c68 as ColorHex, // Main Road - Charcoal (Same as GP for now)
  roadClassZ: 0x7f8c8d as ColorHex, // Collector - Asbestos
  roadClassL: 0x95a5a6 as ColorHex, // Local - Concrete
  roadClassD: 0xdcdde1 as ColorHex, // Service - Light Gravel

  // Lights
  lightAmbient: 0xfffcf7 as ColorHex, // warm cream
  lightPoint: 0xee7b30 as ColorHex, // sunset orange key
} as const;

export type AppColorKey = keyof typeof Colors;

export function getColor(key: AppColorKey): ColorHex {
  return Colors[key];
}
