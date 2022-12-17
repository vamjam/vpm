import { PackageType } from '@shared/enums'

/**
 * Package types mapped from file extension.
 */
const ExtensionMap: Record<PackageType, readonly string[]> = {
  ADDON_PACKAGE: ['.var'],
  APPEARANCE: ['.json', '.vap'],
  ASSET_BUNDLE: ['.assetbundle'],
  CLOTHING: ['.vab', '.vaj', '.vam', '.vap'],
  FAVORITE: ['.fav'],
  HAIR: ['.vab', '.vaj', '.vam', '.vap'],
  LEGACY_SCENE: ['.vac'],
  MANIFEST: ['.json'],
  MORPH: ['.vmb', '.vmi', '.dsf', '.vap'],
  POSE: ['.json', '.vap'],
  PRESET: ['.vap'],
  SCENE: ['.json'],
  SCRIPT: ['.cs'],
  TEXTURE: ['.png', '.jpg', '.jpeg', '.tga', '.tif', '.tiff', '.bmp', '.gif'],
} as const

export default ExtensionMap
