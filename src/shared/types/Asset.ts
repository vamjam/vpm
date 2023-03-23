import Creator from './Creator'
import Image from './Image'

export enum AssetType {
  AddonPackage = 1,
  AssetBundle,
  Clothing,
  Hair,
  Morph,
  Scene,
  Script,
  Subscene,
  Texture,

  AnimationPreset,
  AppearancePreset,
  BreastPreset,
  ClothingPreset,
  GeneralPreset,
  GlutePreset,
  HairPreset,
  MorphPreset,
  PluginPreset,
  PosePreset,
  ScriptPreset,
  SkinPreset,
}

export type AssetTypeName = keyof typeof AssetType

export type AssetEntity = {
  id: number
  name: string
  creatorId: number | null
  type: AssetType | null
  tags: string | null

  // from AddonPackages
  description: string | null
  instructions: string | null
  credits: string | null
  licenseType: string | null

  // from the VaM API
  packageId: number | null
  resourceId: number | null
  hubHosted: number | null
  hubDownloadable: number | null
  releaseDate: number | null
  discussionThreadId: number | null
}

export type AssetFileEntity = {
  id: number
  assetId: number
  path: string
  createdAt: number | null
  updatedAt: number | null
  size: number | null
  version: number | null
}

export type AssetFile = Omit<
  AssetFileEntity,
  'id' | 'assetId' | 'createdAt' | 'updatedAt'
> & {
  id: string
  assetId: string
  createdAt: Date | null
  updatedAt: Date | null
}

type Asset = Omit<
  AssetEntity,
  | 'id'
  | 'creatorId'
  | 'type'
  | 'releaseDate'
  | 'tags'
  | 'hubHosted'
  | 'hubDownloadable'
> & {
  id: string
  creator: Creator | null
  type: AssetTypeName | null
  releaseDate: Date | null
  tags: string[] | null
  hubHosted: boolean | null
  hubDownloadable: boolean | null

  files: Omit<AssetFile, 'assetId'>[] | null
  dependencies: Asset[] | null
  images: Image[]
}

export default Asset
