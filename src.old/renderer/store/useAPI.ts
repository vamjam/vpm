import useSWR, { SWRConfiguration } from 'swr'
import type { API, APIMethodKey } from '@shared/api'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetcher = async (url: keyof API, params: any[]) => {
  const apiMethod = window.api?.[url]
  if (apiMethod instanceof Function) {
    // @ts-ignore: This is a dynamic call, and necessary
    // unless we want to type every call to the API.
    // The error: "A spread argument must either have a tuple
    // type or be passed to a rest parameter.ts (2556)"
    const result = await apiMethod(...params)

    console.log(
      `api.${url}(${params.join(', ')}):`,
      JSON.parse(JSON.stringify(result, null, 2))
    )

    return result
  }

  return undefined
}

type ConfigOrParams = (string | number)[] | SWRConfiguration

const resolveConfigOrParams = (configOrParams?: ConfigOrParams) => {
  if (Array.isArray(configOrParams)) {
    return {
      params: configOrParams,
    }
  }

  return {
    config: configOrParams,
  }
}

/**
 * @param path The api method to call
 * @param configOrParams Config or params
 * @param config SWR config
 * @returns A common response object for all calls to the
 * api, or an object with data, loading, and error properties.
 */
export default function useAPI<T>(
  path: APIMethodKey,
  configOrParams?: (string | number)[] | SWRConfiguration,
  config?: SWRConfiguration
) {
  const resolved = resolveConfigOrParams(configOrParams ?? [])
  const { data, error } = useSWR<T>(
    [path, resolved.params],
    fetcher,
    resolved.config ?? config
  )

  const loading = !data && !error

  return {
    data,
    loading,
    error,
  }
}
