import { PackageType } from '@shared/types'

/**
 * Package types mapped from file extension.
 */
const ExtensionMap: Record<Exclude<PackageType, 'GUIDE'>, readonly string[]> = {
  ADDON: ['.var'],
  APPEARANCE: ['.json', '.vap'],
  ASSET: ['.assetbundle'],
  CLOTHING: ['.vab', '.vaj', '.vam', '.vap'],
  HAIR: ['.vab', '.vaj', '.vam', '.vap'],
  MORPH: ['.vmb', '.vmi', '.dsf', '.vap'],
  POSE: ['.json', '.vap'],
  SCENE: ['.json'],
  SCRIPT: ['.cs'],
  TEXTURE: ['.png', '.jpg', '.jpeg', '.tga', '.tif', '.tiff', '.bmp', '.gif'],
  SUBSCENE: ['.json'],
} as const

export default ExtensionMap
