import useSWR, { SWRConfiguration } from 'swr'
import type { API, APIKey } from '@shared/api'

const fetcher = ([key, params]: [APIKey, Parameters<API[APIKey]>]) => {
  return window.api[key](params[0])
}

export default function useAPI<K extends APIKey>(
  key: K,
  params?: Parameters<API[APIKey]>[0],
  config?: SWRConfiguration
) {
  const { data, error: hasError } = useSWR<Awaited<ReturnType<typeof fetcher>>>(
    [key, params],
    fetcher,
    config
  )

  const isLoading = !data && !hasError

  return {
    data,
    isLoading,
    hasError,
  }
}
