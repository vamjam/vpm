import { PackageType } from '../enums'

const PackageFileLocationMap: Record<number, readonly string[]> = {
  [PackageType.ADDON_PACKAGE.value]: ['/AddonPackages'],
  [PackageType.SCENE.value]: ['/Saves/scene', '/Custom/SubScene'],
} as const

export default PackageFileLocationMap
