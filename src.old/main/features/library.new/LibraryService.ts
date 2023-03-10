import { Package } from '@shared/types'

export default interface LibraryService {
  scan(vam: URL): Promise<void>
  getPackages(): Promise<Package[]>
  searchPackages(query: string): Promise<Package[]>
}
