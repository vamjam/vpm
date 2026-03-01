import { Asset } from './entities.ts'

export type HubAsset = Omit<
  Asset,
  'path' | 'size' | 'updatedAt' | 'importedAt' | 'isHidden' | 'isFavorite'
> & {
  discussionThreadId: number
  creatorId: number
  dependencyCount: number
  description: string
  downloadCount: number
  viewCount: number
  imageURL: string
  creatorIconURL: string
}
