import { Creator, HubPackage, Image, Package } from '@shared/entities'
import { ImageSources, PackageType, PackageTypes } from '@shared/enums'
import logger from '@shared/logger'
import isValidString from '@shared/utils/isValidString'
import {
  FindPackagesResponse,
  GetResourcesResponse,
  PackageMeta,
  Resource,
} from '~/features/hub/types'
import { parseBool, parseDate, parseNumber } from '~/utils/parse'
import parseFileName from '../package/parseFileName'

const log = logger('hub.parser')

const parseId = (value?: string | null) => {
  const id = parseNumber(value)

  if (id == null) {
    throw new Error(`Unable to parse id: "${value}"`)
  }

  return id
}

const parsePackage = (data: PackageMeta) => {
  const pkg: Pick<Package, 'hubResourceId' | 'hubPackageId' | 'hub'> = {
    hubResourceId: parseId(data.resource_id),
    hubPackageId: parseNumber(data.package_id),
    hub: {
      url: data.downloadUrl,
    },
  }

  return pkg
}

export const parseFindPackageResponse = (response?: FindPackagesResponse) => {
  const packages = Object.values(response?.packages ?? {}).map(parsePackage)

  return packages
}

const HubPackageTypeMap: Record<string, PackageType> = {
  Looks: PackageTypes.APPEARANCE,
  Assets: PackageTypes.ASSET_BUNDLE,
  Scenes: PackageTypes.SCENE,
  Plugins: PackageTypes.SCRIPT,
  Clothing: PackageTypes.CLOTHING,
  Morphs: PackageTypes.MORPH,
  Hairstyles: PackageTypes.HAIR,
}

const parseResource = (resource: Resource) => {
  const hubResourceId = parseId(resource.resource_id)
  const hubPackageId = parseNumber(resource.package_id)
  const { name, version } = parseFileName(resource.hubFiles[0].filename)

  const hub: Omit<HubPackage, 'id' | 'packageVarId'> = {
    attachmentId: parseNumber(resource.hubFiles[0].attachment_id) ?? undefined,
    category: resource.category,
    parentCategoryId: parseNumber(resource.parent_category_id) ?? undefined,
    createdAt: parseDate(resource.resource_date) ?? undefined,
    updatedAt: parseDate(resource.last_update) ?? undefined,
    releasedAt: parseDate(resource.release_date) ?? undefined,
    downloadCount: parseNumber(resource.download_count) ?? undefined,
    downloadable: parseBool(resource.hubDownloadable),
    hosted: parseBool(resource.hubHosted),
    url: resource.hubFiles[0].urlHosted,
    rating: parseNumber(resource.rating_weighted) ?? undefined,
    ratingCount: parseNumber(resource.rating_count) ?? undefined,
    type: resource.type,
    viewCount: parseNumber(resource.view_count) ?? undefined,
  }

  const varPkg: Pick<
    Package,
    | 'tags'
    | 'hub'
    | 'hubPackageId'
    | 'hubResourceId'
    | 'name'
    | 'version'
    | 'type'
    | 'isInstalled'
    | 'isSaved'
  > & {
    images: Omit<Image, 'id' | 'packages'>[]
    creator: Omit<Creator, 'id' | 'packages'>
  } = {
    name,
    version,
    type: HubPackageTypeMap[resource.type],
    hubResourceId,
    hubPackageId,
    creator: {
      name: resource.username,
      avatar: resource.icon_url,
    },
    tags: isValidString(resource.tags) ? resource.tags.split(',') : null,
    images: [
      {
        sort: 100,
        url: resource.image_url,
        source: ImageSources.HUB,
      },
    ],
    hub,
    isInstalled: false,
    isSaved: false,
  }

  return varPkg
}

export const parseResourceDetailResponse = (data?: GetResourcesResponse) => {
  if (Array.isArray(data?.resources)) {
    const results = data?.resources
      .map((resource) => {
        try {
          const parsed = parseResource(resource)

          return parsed
        } catch (err) {
          log.error(`Error while parsing resource`, err as Error)

          return undefined
        }
      })
      .filter((r) => r != null)

    return results as Package[]
  }

  return undefined
}
