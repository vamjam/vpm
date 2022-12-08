import {
  Creator,
  HubPackage as HubPackageEntity,
  Package as PackageEntity,
} from '@prisma/client'

type Package = Omit<PackageEntity, 'creatorId' | 'groupId'> & {
  images: string[]
  creator: Creator
  tags?: string[]
}

export default Package

export type HubPackage = Omit<Package, 'creator'> & {
  hub: Omit<HubPackageEntity, 'id' | 'packageId'>
  creator: Omit<Creator, 'id'>
}
