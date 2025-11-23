export type ColorHex = number;

// Centralized application color palette
// Keep domain independent; use only primitive types here
export const Colors = {
  // Backgrounds
  background: 0x9ee3fa as ColorHex, // warm peachy sky
  fog: 0x9ee3fa as ColorHex,

  // Ground
  ground: 0x5ab552 as ColorHex, // sand / dry grass tone

  // Graph primitives
  graphNode: 0x4d3533 as ColorHex, // silver / light gray
  graphRoad: 0x4d3533 as ColorHex,

  // Parking
  parkingBase: 0x4d3533 as ColorHex, // slightly darker than road
  parkingLine: 0xece6d6 as ColorHex, // warm white

  // Lights
  lightAmbient: 0xfffcf7 as ColorHex, // warm cream
  lightPoint: 0xee7b30 as ColorHex, // sunset orange key

  // Truck
  truckBody: 0x3498db as ColorHex, // blue
  truckCabin: 0xffffff as ColorHex, // white
  truckWheel: 0x2c3e50 as ColorHex, // dark grey
  truckContainer: 0xd35400 as ColorHex, // pumpkin orange

  // Delivery Site
  warehouseWall: 0xe8dcc5 as ColorHex, // warm beige concrete
  warehouseRoof: 0x8c7b70 as ColorHex, // warm dark grey
  warehouseAccent: 0xe67e22 as ColorHex, // safety orange
  concreteApron: 0x7f8c8d as ColorHex, // bluish grey concrete
  dockBumper: 0x2c3e50 as ColorHex, // dark rubber
  crateWood: 0xd4ac6e as ColorHex, // wood
  crateBlue: 0x3498db as ColorHex,
  crateRed: 0xe74c3c as ColorHex,

  // Nature
  treeTrunk: 0x8b5a2b as ColorHex, // warm wood brown
  treeFoliage: 0x26854c as ColorHex, // olive green
} as const;

export type AppColorKey = keyof typeof Colors;

export function getColor(key: AppColorKey): ColorHex {
  return Colors[key];
}
