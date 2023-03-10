export type CreatorEntity = {
  id: number
  name: string
  avatar: string
}

type Creator = Omit<CreatorEntity, 'id'> & {
  id: string
}

export default Creator
