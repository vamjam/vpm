import { Creator, CreatorEntity } from '@shared/types'
import hashid from '@shared/utils/hashid'

export const fromEntity = <T extends CreatorEntity | null>(data: T | null) => {
  if (data == null || data.id == null) {
    return null
  }

  const creator: Creator = {
    avatar: data.avatar,
    id: hashid.encode(data.id),
    name: data.name ?? null,
    userId: data.userId,
  }

  return creator
}
