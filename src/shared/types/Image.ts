export type ImageEntity = {
  id: number
  assetId: number
  path: string
  sort: number
}

type Image = Omit<ImageEntity, 'id' | 'assetId'> & {
  id: string
}

export default Image
