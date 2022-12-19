import useSWR, { SWRConfiguration } from 'swr'
import type { API } from '@shared/api'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetcher = async (url: keyof API, params: any[]) => {
  const apiMethod = window.api?.[url]

  if (apiMethod instanceof Function) {
    // @ts-ignore: This is a dynamic call and is necessary,
    // unless we want to define every possible API method...
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
  const resolved = {
    config: undefined,
    params: undefined,
  }

  if (Array.isArray(configOrParams)) {
    return {
      ...resolved,
      params: configOrParams,
    }
  }

  return {
    ...resolved,
    config: configOrParams,
  }
}

export default function useAPI<T>(
  path: keyof API,
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
