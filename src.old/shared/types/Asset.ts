import { Asset as AssetEntity } from '../entities'
import Image from './Image'
import { PackageType } from './Package'

type Asset = Omit<AssetEntity, 'id' | 'sourceId' | 'type'> & {
  id: string
  type: PackageType
  image: Image
}

export default Asset
