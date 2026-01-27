import { Asset as AssetEntity, Creator } from './entities.ts'

export { AssetType, type Creator } from './entities.ts'

export type Asset = AssetEntity & {
  creator?: Creator | null
}
