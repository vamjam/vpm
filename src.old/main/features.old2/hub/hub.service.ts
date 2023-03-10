import got, { Method } from 'got'
import { Package } from '@shared/entities'
import logger from '@shared/logger'
import {
  parseFindPackageResponse,
  parseResourceDetailResponse,
} from './HubParser'
import {
  FindPackagesResponse,
  GetResourceDetailResponse,
  GetResourcesResponse,
  RequestPayload,
} from './types'

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
    log.error(`Error while making request to hub`, err as Error)

    return undefined
  }
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

      return parseFindPackageResponse(results)
    } catch (err) {
      log.error(`Error while finding packages`, err as Error)

      return undefined
    }
  }

  async listPackages(
    page: number,
    take: number,
    location = 'Hub And Dependencies',
    category = 'Free',
    sort = 'Latest Update'
  ) {
    try {
      const payload: RequestPayload = {
        source: 'VaM',
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

      return undefined
    }
  }
}

export default new HubService()
