import https from 'node:https'
import parse from '~/lib/HubResourceParser'
import {
  ErrorResponse,
  FindPackagesResponse,
  GetResourceDetailResponse,
  GetResourcesResponse,
  RequestPayload,
  SuccessResponse,
  UnknownResponse,
} from '~/lib/HubTypes'

export default class HubService {
  async getPackageDetails(resourceId: number) {
    const payload = {
      action: 'getResourceDetail',
      latest_image: 'Y',
      resource_id: resourceId.toString(),
    }

    return makeRequest<GetResourceDetailResponse>('POST', payload)
  }

  /**
   *
   * @param packageIds Package Id in the format:
   * "{CreatorName}.{PackageName}.{Version}" (Case Insensitive)
   * where {Version} can be "latest", or a number
   * @returns
   */
  async findPackages(...packageIds: string[]) {
    try {
      const payload = {
        action: 'findPackages',
        packages: packageIds.join(','),
      }

      const results = makeRequest<FindPackagesResponse>('POST', payload)
    } catch (err) {
      console.error(err)

      return []
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

      return parse(result)
    } catch (err) {
      console.error(err)

      return []
    }
  }
}

type RequestOptions = {
  hostname: string
  path: string
  port: number
  headers?: Record<string, string | number>
}

const globalOptions: RequestOptions = {
  hostname: 'hub.virtamate.com',
  path: '/citizenx/api.php',
  port: 443,
  headers: {
    'Content-Type': 'application/json',
  },
}

const makeRequest = async <T>(
  method: 'GET' | 'POST',
  payload?: Record<string, string>
): Promise<T> => {
  return new Promise((resolve, reject) => {
    let response = ''
    const body = JSON.stringify({
      source: 'VaM',
      ...payload,
    })

    const opts = {
      ...globalOptions,
      method,
      headers: {
        ...globalOptions.headers,
        'Content-Length': body.length,
      },
    }

    const req = https.request(opts, (res) => {
      res.on('data', (chunk) => {
        response += chunk.toString()
      })

      res.on('error', reject)

      res.on('end', () => {
        try {
          const result = JSON.parse(response) as
            | (SuccessResponse & T)
            | ErrorResponse

          if (result.status === 'error') {
            reject(result)
          } else if (result.status === 'success') {
            resolve(result)
          } else {
            reject(
              new Error(
                `Unknown response status "${
                  (result as UnknownResponse)?.status
                }"`
              )
            )
          }
        } catch (err) {
          console.error(err)

          reject(err)
        }
      })
    })

    req.on('error', reject)
    req.write(body)
    req.end()
  })
}
