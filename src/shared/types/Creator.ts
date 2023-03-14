export type CreatorEntity = {
  id: number
  name: string
  avatar: string
}

type Creator = Omit<Partial<CreatorEntity>, 'id'> & {
  id: string
}

export default Creator
