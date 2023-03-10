export type ImageEntity = {
  id: number
  assetId: number
  url: string
  sort: number
}

type Image = Omit<ImageEntity, 'id' | 'assetId'> & {
  id: string
}

export default Image
