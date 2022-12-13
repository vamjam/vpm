import { API } from '@shared/types'

type APIResource = `/api/${keyof API}`

export default function fetcher<T>(
  resource: APIResource,

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) {
  const method = resource.replace('/api/', '') as keyof API

  if (window?.api != null) {
    // @ts-ignore: this works on account of the above
    const data = window.api?.[method](...args)

    return data as T
  }

  return undefined
}
