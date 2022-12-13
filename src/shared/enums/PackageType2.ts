export const PackageTypes = {
  ADDON_PACKAGE: 'ADDON_PACKAGE',
  APPEARANCE: 'APPEARANCE',
  ASSET_BUNDLE: 'ASSET_BUNDLE',
  CLOTHING: 'CLOTHING',
  FAVORITE: 'FAVORITE',
  HAIR: 'HAIR',
  LEGACY_SCENE: 'LEGACY_SCENE',
  MANIFEST: 'MANIFEST',
  MORPH: 'MORPH',
  POSE: 'POSE',
  PRESET: 'PRESET',
  SCENE: 'SCENE',
  SCRIPT: 'SCRIPT',
  TEXTURE: 'TEXTURE',
} as const

type PackageType = keyof typeof PackageTypes

export default PackageType
