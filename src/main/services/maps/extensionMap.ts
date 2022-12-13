import { PackageType } from '@shared/enums'

const extensionMap: Record<PackageType, readonly string[]> = {
  AddonPackage: ['.var'],
  Appearance: ['.json', '.vap'],
  AssetBundle: ['.assetbundle'],
  Clothing: ['.vab', '.vaj', '.vam', '.vap'],
  Favorite: ['.fav'],
  Hair: ['.vab', '.vaj', '.vam', '.vap'],
  LegacyScene: ['.vac'],
  Manifest: ['.json'],
  Morph: ['.vmb', '.vmi', '.dsf', '.vap'],
  Pose: ['.json', '.vap'],
  Preset: ['.vap'],
  Scene: ['.json'],
  Script: ['.cs'],
  Texture: ['.png', '.jpg', '.jpeg', '.tga', '.tif', '.tiff', '.bmp', '.gif'],
} as const

export default extensionMap
