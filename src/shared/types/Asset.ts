import Creator from './Creator'
import Dependency from './Dependency'
import Image from './Image'

export enum AssetType {
  AssetBundle = 1,
  Clothing,
  Hair,
  Morph,
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
  Scene,
  Script,
  Subscene,
  Texture,
}

export type AssetEntity = {
  id: number
  createdAt: number | null
  size: number | null
  name: string
  version: number | null
  creatorId: number | null
  url: string
  type: AssetType | null
}

type Asset = Omit<AssetEntity, 'id' | 'creatorId' | 'createdAt'> & {
  id: string
  createdAt: Date | null
  creator: Creator
  dependencies: Dependency[] | null
  images: Image[] | null
}

export default Asset
