import { Packages, ResourceDetail } from './types.ts'

type Action = 'getResourceDetail' | 'getResources' | 'findPackages'

export type Category = 'Free'
export type Sort = 'Latest Update'

export async function getResources(
  page: number,
  pageSize: number,
  category: Category,
  sort: Sort,
): Promise<Packages | undefined> {
  const payload = {
    page: page.toString(),
    perpage: pageSize.toString(),
    category,
    sort,
    latest_image: 'Y',
    location: 'Hub And Dependencies',
  }

  return makeRequest<Packages>('getResources', payload)
}

export async function findPackage(
  packageName: string,
  creatorName: string,
  version?: string,
): Promise<ResourceDetail | undefined> {
  let packages = `${creatorName}.${packageName}`

  if (version != null) {
    packages += `.${version}`
  }

  const payload = {
    packages,
  }

  const data = await makeRequest<Packages>('findPackages', payload)

  if (data == null) {
    return undefined
  }

  const resourceId = Number(data.packages[packages]?.resource_id)

  return getResourceDetail(resourceId)
}

export async function getResourceDetail(
  resourceId: number,
): Promise<ResourceDetail | undefined> {
  const payload = {
    latest_image: 'Y',
    resource_id: resourceId.toString(),
  }

  const response = await makeRequest<ResourceDetail>(
    'getResourceDetail',
    payload,
  )

  if (!response) {
    return undefined
  }

  return response
}

async function makeRequest<T>(
  action: Action,
  payload: Record<string, string>,
): Promise<T | undefined> {
  try {
    const response = await fetch(`https://hub.virtamate.com/citizenx/api.php`, {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        source: 'VaM',
        action,
      }),
    })

    if (response.ok) {
      return response.json() as T
    }

    return undefined
  } catch (err) {
    console.error(`VaM API request failed`, err as Error)

    return undefined
  }
}
