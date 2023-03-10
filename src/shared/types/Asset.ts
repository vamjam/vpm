import Creator from './Creator'
import Dependency from './Dependency'
import Image from './Image'

export type AssetType =
  | 'Appearance'
  | 'Clothing'
  | 'Hair'
  | 'Morph'
  | 'Pose'
  | 'Preset'
  | 'Scene'
  | 'Subscene'
  | 'Script'
  | 'Texture'

export type AssetEntity = {
  id: number
  name: string
  version: number
  creatorId: number
  url: string
  type: AssetType | null
}

type Asset = Omit<AssetEntity, 'id' | 'creatorId'> & {
  id: string
  creator: Creator
  dependencies: Dependency[] | null
  images: Image[] | null
}

export default Asset
