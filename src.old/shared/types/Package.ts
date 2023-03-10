import { Package as PackageEntity } from '../entities'
import Creator from './Creator'
import Image from './Image'
import Source from './Source'

export const PackageTypes = {
  ADDON: 'ADDON',
  APPEARANCE: 'APPEARANCE',
  ASSET: 'ASSET',
  CLOTHING: 'CLOTHING',
  GUIDE: 'GUIDE',
  HAIR: 'HAIR',
  MORPH: 'MORPH',
  POSE: 'POSE',
  PRESET: 'PRESET',
  SCENE: 'SCENE',
  SUBSCENE: 'SUBSCENE',
  SCRIPT: 'SCRIPT',
  TEXTURE: 'TEXTURE',
} as const

export type PackageType = keyof typeof PackageTypes

export const PresetTypes = [
  PackageTypes.APPEARANCE,
  PackageTypes.CLOTHING,
  PackageTypes.HAIR,
  PackageTypes.MORPH,
  PackageTypes.POSE,
]

export type PresetType = (typeof PresetTypes)[number]

type Package = Omit<PackageEntity, 'id' | 'creatorId' | 'type' | 'tags'> & {
  id: string
  images: Image[]
  creator: Creator
  type: PackageType | null
  tags: string[] | null
  sources: Source[] | null
}

export default Package
