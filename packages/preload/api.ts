import { ipcRenderer } from 'electron'
import { Config } from '@shared/types'
import { Api } from '@shared/types'

const hub = {
  get: async (take?: number, skip?: number) => {
    return ipcRenderer.invoke('hub:get', take, skip)
  },
  find: async (...ids: string[]) => {
    return ipcRenderer.invoke('hub:find', ids)
  },
  detail: async (id: string) => {
    return ipcRenderer.invoke('hub:detail', id)
  },
}

export default {
  hub,
  selectFolder: async () => {
    return ipcRenderer.invoke('dialog:openDirectory')
  },
  getConfig: async () => {
    return ipcRenderer.invoke('config:get')
  },
  setConfig: async (config: Partial<Config>) => {
    return ipcRenderer.invoke('config:set', config)
  },
  scan: async () => {
    return ipcRenderer.invoke('scan')
  },
  abortScan: async () => {
    return ipcRenderer.invoke('scan:abort')
  },
  getPackages: async () => {
    return ipcRenderer.invoke('packages:get')
  },
  deletePackage: async (id: string) => {
    return ipcRenderer.invoke('packages:delete', id)
  },
  on: (event: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.on(event, (_, ...args) => callback(...args))
  },
} as Api
