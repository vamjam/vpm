import { Image } from '@shared/types'
import hashid from '@shared/utils/hashid'
import { ImageEntityQuery } from '~/db/Repository'

export const fromEntity = (data: ImageEntityQuery) => {
  if (data['image.id'] && data['image.path'] && data['image.sort']) {
    return [
      {
        id: hashid.encode(data['image.id']),
        path: data['image.path'],
        sort: data['image.sort'],
      } as Image,
    ]
  }

  return []
}
