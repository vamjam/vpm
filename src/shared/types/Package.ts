import { Creator, Image, VarPackage } from '@prisma/client'

type Package = Omit<VarPackage, 'creatorId'> & {
  creator: Omit<Creator, 'id'>
  images: (Omit<Image, 'id' | 'varId' | 'sort'> & { sort?: number })[]
  tags?: string[] | null

  /**
   * Computed properties, not saved to the database
   */
  // Looks at the package's url. If it's in the vpm library,
  // it's not installed.
  isInstalled?: boolean
  // Used a lot by VaM as a unique identifier.
  // Format: creatorName.packageName.version
  // where version can be a string of 'latest'
  key?: string
}

export default Package
