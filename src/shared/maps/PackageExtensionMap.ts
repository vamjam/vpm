import { PackageType } from '../enums'

const PackageExtensionMap: Record<number, readonly string[]> = {
  [PackageType.ADDON_PACKAGE.value]: ['.var'],
  [PackageType.LEGACY_SCENE.value]: ['.vac'],
  [PackageType.MORPH.value]: ['.vmb', '.vmi', '.dsf'],
  [PackageType.HAIR.value]: ['.vab', '.vaj', '.vam'],
  [PackageType.CLOTHING.value]: ['.vab', '.vaj', '.vam'],
  [PackageType.PRESET.value]: ['.vap'],
  [PackageType.FAVORITE.value]: ['.fav'],
  [PackageType.SCRIPT.value]: ['.cs'],
  [PackageType.MANIFEST.value]: ['.json'],
  [PackageType.SCENE.value]: ['.json'],
  [PackageType.ASSET_BUNDLE.value]: ['.assetbundle'],
} as const

export default PackageExtensionMap

export const getPackageTypeFromExtension = (
  ext: string
): PackageType | undefined => {
  const result = Object.entries(PackageExtensionMap).find(([, exts]) =>
    exts.includes(ext)
  )

  return PackageType.fromValue(result?.[0])
}
