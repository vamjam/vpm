import { useState } from 'react'
import useSWR from 'swr'
import { PageParams } from '@shared/api'

type ResourceType = 'addons:get' | 'assets:get'

const fetcher = ([key, pageParams]: [ResourceType, PageParams]) => {
  return window.api[key](pageParams)
}

export default function useFetcher(key: ResourceType) {
  const [pageParams, setPageParams] = useState<PageParams>({
    limit: 20,
    page: 0,
  })

  const { data, error, loading } = useSWR([key, pageParams], fetcher)

  return {
    data,
    error,
    loading,
  }
}
