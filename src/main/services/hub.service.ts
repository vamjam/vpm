import got, { Method } from 'got'
import logger from '@shared/logger'
import { HubPackage, Package } from '@shared/types'
import PackageUtils from '@shared/utils/PackageUtils'
import {
  parseFindPackageResponse,
  parseResourceDetailResponse,
} from './hub/HubParser'
import {
  FindPackagesResponse,
  GetResourceDetailResponse,
  GetResourcesResponse,
  RequestPayload,
} from './hub/types'

const log = logger('hub.service')

const makeRequest = async <T>(
  method: Method,
  payload: Record<string, unknown>
) => {
  try {
    const response = await got<T>(
      'https://hub.virtamate.com/citizenx/api.php',
      {
        method,
        json: payload,
      }
    ).json<T>()

    if (response != null) {
      return response
    }

    return undefined
  } catch (err) {
    log.error(`Error while making request to hub`, err)

    return undefined
  }
}

const mergeData = (
  packages: Package[],
  hubPackages: Pick<HubPackage, 'resourceId' | 'packageId' | 'hubURL'>[]
): Package[] => {
  return packages.map((pkg) => {
    const pkgKey = PackageUtils.createKey(pkg)
    // const match = hubPackages.find(
    //   (hubPkg) => PackageUtils.createKey(hubPkg) === pkgKey
    // )

    return {
      ...pkg,
    }
  })
}

class HubService {
  async getPackageDetails(resourceId: number) {
    const payload = {
      action: 'getResourceDetail',
      latest_image: 'Y',
      resource_id: resourceId.toString(),
    }

    return makeRequest<GetResourceDetailResponse>('POST', payload)
  }

  async findPackages(...packages: Package[]) {
    try {
      const packageIds = packages.map(
        ({ creator, name, version }) =>
          `${creator.name}.${name}.${version ?? 'latest'}`
      )

      const payload = {
        action: 'findPackages',
        packages: packageIds,
      }

      const results = await makeRequest<FindPackagesResponse>('POST', payload)

      return mergeData(packages, parseFindPackageResponse(results))
    } catch (err) {
      log.error(`Error while finding packages`, err)

      return undefined
    }
  }

  async listPackages(
    page = 0,
    take = 25,
    location = 'Hub And Dependencies',
    category = 'Free',
    sort = 'Latest Update'
  ) {
    try {
      const payload: Omit<RequestPayload, 'source'> = {
        action: 'getResources',
        latest_image: 'Y',
        perpage: take.toString(),
        page: (page + 1).toString(),
        location,
        category,
        sort,
      }

      const result = await makeRequest<GetResourcesResponse>('POST', payload)

      return parseResourceDetailResponse(result)
    } catch (err) {
      console.error(err)

      return []
    }
  }
}

export default new HubService()
