import * as THREE from "three";

const textureLoaderSingleton: { loader?: THREE.TextureLoader } = {};

export function getTextureLoader(): THREE.TextureLoader {
  if (!textureLoaderSingleton.loader) {
    textureLoaderSingleton.loader = new THREE.TextureLoader();
  }
  return textureLoaderSingleton.loader;
}

type LoadOptions = {
  colorSpace?: THREE.ColorSpace;
};

const textureCache = new Map<string, THREE.Texture>();

export function loadRepeatedTexture(
  url: string,
  repeatX: number,
  repeatY: number,
  options: LoadOptions = {}
): THREE.Texture {
  const key = `${url}|${repeatX}x${repeatY}|${options.colorSpace ?? "none"}`;
  const cached = textureCache.get(key);
  if (cached) return cached;

  const loader = getTextureLoader();
  const texture = loader.load(url);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  if (options.colorSpace) {
    texture.colorSpace = options.colorSpace;
  }
  textureCache.set(key, texture);
  return texture;
}

export type PoliigonGrass4585Maps = {
  baseColor: THREE.Texture;
  normal: THREE.Texture;
  roughness: THREE.Texture;
  metallic?: THREE.Texture;
};

export function loadPoliigonGrass4585(
  repeatX: number,
  repeatY: number
): PoliigonGrass4585Maps {
  const basePath = "/textures/Poliigon_GrassPatchyGround_4585";

  const baseColor = loadRepeatedTexture(
    `${basePath}/Poliigon_GrassPatchyGround_4585_BaseColor.jpg`,
    repeatX,
    repeatY,
    { colorSpace: THREE.SRGBColorSpace }
  );

  const normal = loadRepeatedTexture(
    `${basePath}/Poliigon_GrassPatchyGround_4585_Normal.png`,
    repeatX,
    repeatY
  );

  const roughness = loadRepeatedTexture(
    `${basePath}/Poliigon_GrassPatchyGround_4585_Roughness.jpg`,
    repeatX,
    repeatY
  );

  return { baseColor, normal, roughness };
}
