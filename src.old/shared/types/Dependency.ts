import { Dependency as DependencyEntity } from '../entities'

type Dependency = Omit<DependencyEntity, 'id' | 'sourceId' | 'version'> & {
  id: string
  sourceId: string
  creatorId: string
  version: number | 'latest'
}

export default Dependency
