import { ipcRenderer } from 'electron'
import type { LibraryType } from './enums'
import type { ConfigKey, ConfigValue } from './types'

/**
 * The API that is exposed on the window object in the
 * renderer process.
 */
const api = {
  async selectFolder() {
    return ipcRenderer.invoke('dialog:openDirectory')
  },

  async getConfig() {
    return ipcRenderer.invoke('config:get')
  },

  async setConfig(key?: ConfigKey, value?: ConfigValue) {
    return ipcRenderer.invoke('config:set', key, value)
  },

  async getLibrary(libraryType: LibraryType) {
    return ipcRenderer.invoke('packages:list', libraryType)
  },
} as const

export type API = typeof api

export default api
