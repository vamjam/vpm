import { ipcRenderer } from 'electron'
import DotNotation from './lib/DotNotation'

/**
 * The API that is exposed to the window object in the
 * renderer process, via the preload script.
 */
const api = {
  config: {
    async get<T>(key: string) {
      return ipcRenderer.invoke('config:get', key) as T
    },
    async set<T>(key: string, value: T) {
      return ipcRenderer.invoke('config:set', key, value)
    },
  },
  dialog: {
    async openDirectory() {
      return ipcRenderer.invoke('dialog:openDirectory')
    },
  },
} as const

export type API = typeof api

export default api

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type APIMethodKey = DotNotation<API, (...args: any[]) => any>
