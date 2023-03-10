export type Creator = {
  id: number
  name: string
  avatar: string | null
}

export type Dependency = {
  id: number
  sourceId: number
  creatorId: number
  name: string
  version: string
}

export type Image = {
  id: number
  url: string
  sort: number | null
}

export type PackageImage = {
  packageId: number
  imageId: number
}

export type AssetImage = {
  assetId: number
  imageId: number
}

export type Package = {
  id: number
  name: string
  creatorId: number
  type: string | null
  tags: string | null
}

export type Source = {
  id: number
  packageId: number

  url: string | null
  size: number | null
  createdAt: number
  updatedAt: number | null

  version: number | null
  isActive: number

  description: string | null
  instructions: string | null
  credits: string | null
  licenseType: string | null
}

export type Asset = {
  id: number
  sourceId: number
  type: string | null
  name: string
  path: string
}
