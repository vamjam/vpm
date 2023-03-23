import { ipcRenderer } from 'electron'
import { Asset, AssetFile, AssetTypeName } from './types'

export type PageParams = {
  page?: number
  limit?: number
  orderBy?: keyof Asset | `file.${keyof AssetFile}`
  orderDir?: 'desc' | 'asc'
}

export type GetAssetParams = {
  type: AssetTypeName
  pager?: PageParams
}

const api = {
  'dialog:openDirectory'(): Promise<string[]> {
    return ipcRenderer.invoke('dialog:openDirectory')
  },
  'assets:get'(params?: GetAssetParams): Promise<Record<string, Asset>> {
    return ipcRenderer.invoke('assets:get', params)
  },
}

export default api

export type API = typeof api

export type APIKey = keyof API
