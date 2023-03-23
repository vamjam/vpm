export type CreatorEntity = {
  id: number
  name: string | null
  avatar: string | null
  userId: number | null
}

type Creator = Omit<CreatorEntity, 'id'> & {
  id: string
}

export default Creator
