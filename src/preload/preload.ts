import { contextBridge, ipcRenderer } from 'electron'
import { createAPI } from '@shared/api.ts'

const api = createAPI(ipcRenderer)

contextBridge.exposeInMainWorld('api', api)

ipcRenderer.on('scan', (_event, payload) => {
  window.dispatchEvent(new CustomEvent('scan', { detail: payload }))
})
