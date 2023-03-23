import Asset from './Asset'

export type AddonEntity = {
  id: number
  assetId: number
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
    createdAt: Date | null
    assets: Asset[] | null
    addonId: string | null
  }

export default Addon
