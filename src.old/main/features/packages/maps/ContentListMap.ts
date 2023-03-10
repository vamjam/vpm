import path from 'node:path'
import { PackageType } from '@shared/types'
import ExtensionMap from './ExtensionMap'

type CustomPackageType = Extract<
  PackageType,
  | 'SCENE'
  | 'CLOTHING'
  | 'POSE'
  | 'SCRIPT'
  | 'TEXTURE'
  | 'ASSET_BUNDLE'
  | 'ADDON_PACKAGE'
>

const ContentListMap: Record<CustomPackageType, (p: string) => boolean> = {
  SCENE: (p: string) => p.includes('Saves\\scene'),
  CLOTHING: (p: string) => p.includes('Custom\\Clothing'),
  POSE: (p: string) => p.includes('Custom\\Atom\\Person\\Pose'),
  SCRIPT: (p: string) => p.includes('Custom\\Scripts'),
  TEXTURE: (p: string) => p.includes('Custom\\Textures'),
  ASSET_BUNDLE: (p: string) => {
    return (
      p.includes('Custom\\Assets') &&
      ExtensionMap.ASSET_BUNDLE.includes(path.parse(p).ext)
    )
  },
  ADDON_PACKAGE: (p: string) => {
    return (
      p.includes('Custom\\Assets') &&
      ExtensionMap.ADDON_PACKAGE.includes(path.parse(p).ext)
    )
  },
} as const

export default ContentListMap
