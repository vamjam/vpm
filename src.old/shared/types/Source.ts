import { Source as SourceEntity } from '../entities'
import Asset from './Asset'
import Dependency from './Dependency'

type Source = Omit<
  SourceEntity,
  'id' | 'packageId' | 'createdAt' | 'updatedAt' | 'isActive'
> & {
  id: string
  createdAt: Date
  updatedAt: Date | null

  isActive: boolean

  dependencies: Dependency[] | null
  assets: Asset[] | null
}

export default Source
