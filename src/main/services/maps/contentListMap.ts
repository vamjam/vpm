import path from 'node:path'
import { PackageTypes } from '@shared/enums'
import extensionMap from './extensionMap'

type ContentListPackages =
  | typeof PackageTypes.Scene
  | typeof PackageTypes.Clothing
  | typeof PackageTypes.Pose
  | typeof PackageTypes.Script
  | typeof PackageTypes.AssetBundle
  | typeof PackageTypes.Texture

const contentListMap: Record<ContentListPackages, (p: string) => boolean> = {
  Scene: (p: string) => p.includes('Saves\\scene'),
  Clothing: (p: string) => p.includes('Custom\\Clothing'),
  Pose: (p: string) => p.includes('Custom\\Atom\\Person\\Pose'),
  Script: (p: string) => p.includes('Custom\\Scripts'),
  Texture: (p: string) => p.includes('Custom\\Textures'),
  AssetBundle: (p: string) => {
    return (
      p.includes('Custom\\Assets') &&
      extensionMap.AssetBundle.includes(path.parse(p).ext)
    )
  },
} as const

export default contentListMap
