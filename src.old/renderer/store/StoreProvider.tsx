import { ReactNode } from 'react'
import { SWRConfig } from 'swr'
import { PublicConfiguration } from 'swr/_internal'
import fetcher from './fetcher'

type StoreProviderProps = {
  children?: ReactNode
}

const config: Partial<PublicConfiguration> = {
  refreshInterval: 3000,
  fetcher,
}

export default function StoreProvider({ children }: StoreProviderProps) {
  return <SWRConfig value={config}>{children}</SWRConfig>
}
