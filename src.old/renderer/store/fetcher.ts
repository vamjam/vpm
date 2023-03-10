import { API } from '@shared/api'

type APIResource = `/api/${keyof API}`

export default async function fetcher<T>(
  resource: APIResource,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...args: any[]
) {
  const method = resource.replace('/api/', '') as keyof API

  if (window?.api != null) {
    // @ts-ignore: this works on account of the above
    const data = await window.api?.[method](...args)

    return data as T
  }

  return undefined
}
