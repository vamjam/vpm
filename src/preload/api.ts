import { ipcRenderer } from 'electron'
import type { API, ConfigKey, ConfigValue } from '@shared/types'

/**
 * The API that is exposed on the window object in the
 * renderer process.
 */
const api: API = {
  async selectFolder() {
    return ipcRenderer.invoke('dialog:openDirectory')
  },

  async getConfig() {
    return ipcRenderer.invoke('config:get')
  },

  async setConfig(key?: ConfigKey, value?: ConfigValue) {
    return ipcRenderer.invoke('config:set', key, value)
  },
}

export default api
