import { AssetType } from '@shared/types'
import logger from '~/logger'
import * as API from './apiTypes'

const log = logger('vam.api')

type Action = 'getResourceDetail' | 'getResources' | 'findPackages'

export const APITypeMap: Record<string, AssetType> = {
  Looks: AssetType.AppearancePreset,
  Scenes: AssetType.Scene,
  Assets: AssetType.AssetBundle,
  Plugins: AssetType.Script,
  Clothing: AssetType.Clothing,
  Hairstyles: AssetType.Hair,
  // Guides:
  Textures: AssetType.Texture,
}

const makeRequest = async <T>(
  action: Action,
  payload: Record<string, string>
) => {
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
    log.error(`VaM API request failed`, err as Error)

    return undefined
  }
}

export const getResourceDetail = async (resourceId: number) => {
  const payload = {
    latest_image: 'Y',
    resource_id: resourceId.toString(),
  }

  const response = await makeRequest<API.ResourceDetail>(
    'getResourceDetail',
    payload
  )

  if (!response) {
    return undefined
  }

  return response
}

export const findPackage = async (
  packageName: string,
  creatorName: string,
  version?: string
) => {
  let packages = `${creatorName}.${packageName}`

  if (version != null) {
    packages += `.${version}`
  }

  const payload = {
    packages,
  }

  const data = await makeRequest<API.Packages>('findPackages', payload)

  if (data == null) {
    return undefined
  }

  const resourceId = Number(data.packages[packages]?.resource_id)

  return getResourceDetail(resourceId)
}
