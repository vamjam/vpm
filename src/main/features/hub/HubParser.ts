import { HubPackage, Package } from '@shared/entities'
import { ImageSources } from '@shared/enums'
import logger from '@shared/logger'
import isValidString from '@shared/utils/isValidString'
import {
  FindPackagesResponse,
  GetResourcesResponse,
  PackageMeta,
  Resource,
} from '~/features/hub/types'
import { parseBool, parseDate, parseNumber } from '~/utils/parse'

const log = logger('hub.parser')

const parseId = (value?: string | null) => {
  const id = parseNumber(value)

  if (id == null) {
    throw new Error(`Unable to parse resource id: "${value}"`)
  }

  return id
}

const parsePackage = (data: PackageMeta) => {
  const hubPackage: Pick<HubPackage, 'resourceId' | 'packageId' | 'hubURL'> = {
    resourceId: parseId(data.resource_id),
    packageId: parseNumber(data.package_id),
    hubURL: data.downloadUrl,
  }

  return hubPackage
}

export const parseFindPackageResponse = (response?: FindPackagesResponse) => {
  const packages = Object.values(response?.packages ?? {}).map(parsePackage)

  return packages
}

const parseResource = (resource: Resource) => {
  const hubPackage: Omit<HubPackage, 'id' | 'packageVarId'> = {
    resourceId: parseId(resource.resource_id),
    attachmentId: parseNumber(resource.hubFiles[0].attachment_id),
    packageId: parseNumber(resource.package_id),
    category: resource.category,
    parentCategoryId: parseNumber(resource.parent_category_id),
    createdAt: parseDate(resource.resource_date),
    updatedAt: parseDate(resource.last_update),
    releasedAt: parseDate(resource.release_date),
    downloadCount: parseNumber(resource.download_count),
    hubDownloadable: parseBool(resource.hubDownloadable),
    hubHosted: parseBool(resource.hubHosted),
    hubURL: resource.hubFiles[0].urlHosted,
    rating: parseNumber(resource.rating_weighted),
    ratingCount: parseNumber(resource.rating_count),
    type: resource.type,
    viewCount: parseNumber(resource.view_count),
  }

  const varPkg: Pick<Package, 'creator' | 'images' | 'tags'> = {
    creator: {
      name: resource.username,
      avatar: resource.icon_url,
    },
    images: [
      {
        url: resource.image_url,
        type: ImageSources.HUB_IMAGE,
      },
    ],
    tags: isValidString(resource.tags) ? resource.tags.split(',') : null,
  }

  return [hubPackage, varPkg] as const
}

export const parseResourceDetailResponse = (data?: GetResourcesResponse) => {
  const results = data?.resources
    .map((resource) => {
      try {
        const parsed = parseResource(resource)

        return parsed
      } catch (err) {
        log.error(`Error while parsing resource`, err)

        return undefined
      }
    })
    .filter((r) => r != null)

  return results
}
