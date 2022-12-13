import { ipcRenderer } from 'electron'
import { API, ConfigKey, ConfigValue } from '@shared/types'

// const hub = {
//   get: async (take?: number, skip?: number) => {
//     return ipcRenderer.invoke('hub:get', take, skip)
//   },
//   find: async (...ids: string[]) => {
//     return ipcRenderer.invoke('hub:find', ids)
//   },
//   detail: async (id: string) => {
//     return ipcRenderer.invoke('hub:detail', id)
//   },
// }

const api: API = {
  // hub,
  selectFolder: async () => {
    return ipcRenderer.invoke('dialog:openDirectory')
  },
  getConfig: async () => {
    return ipcRenderer.invoke('config:get')
  },
  setConfig: async (key?: ConfigKey, value?: ConfigValue) => {
    return ipcRenderer.invoke('config:set', key, value)
  },
  // scan: async () => {
  //   return ipcRenderer.invoke('scan')
  // },
  // abortScan: async () => {
  //   return ipcRenderer.invoke('scan:abort')
  // },
  // getPackages: async () => {
  //   return ipcRenderer.invoke('packages:get')
  // },
  // deletePackage: async (id: string) => {
  //   return ipcRenderer.invoke('packages:delete', id)
  // },
  // on: <T>(event: string, callback: (_: unknown, ...args: T[]) => void) => {
  //   ipcRenderer.on(event, (_, ...args) => callback(args))
  // },
}

export default api
