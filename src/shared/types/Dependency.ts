import Creator from './Creator'

export type DependencyEntity = {
  id: number
  assetId: number
  creatorId: number
  name: string
  version: string
}

type Dependency = Omit<
  DependencyEntity,
  'id' | 'creatorId' | 'version' | 'assetId'
> & {
  id: string
  creator: Creator
  version: number | 'latest'
}

export default Dependency
