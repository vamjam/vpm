import Asset from './Asset'

export type AddonEntity = {
  id: number
  assetId: number
  createdAt: number
  size: number | null
  description: string | null
  instructions: string | null
  credits: string | null
  licenseType: string | null
}

export type AddonAssetEntity = {
  addonId: number
  assetId: number
}

type Addon = Omit<AddonEntity, 'id' | 'createdAt' | 'creatorId' | 'assetId'> &
  Asset & {
    createdAt: Date
    assets: Asset[] | null
  }

export default Addon
