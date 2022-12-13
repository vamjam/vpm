import useSWR from 'swr'
import { API } from '@shared/types'

export default function useAPI<T>(path: keyof API) {
  const { data, error } = useSWR<T>(`/api/${path}`)
  const loading = !data && !error

  return {
    data,
    loading,
    error,
  }
}
