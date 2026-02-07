import { createAPI } from '@shared/api.ts'
import { contextBridge, ipcRenderer } from 'electron'

const api = createAPI(ipcRenderer)

contextBridge.exposeInMainWorld('api', api)

ipcRenderer.on('scan.worker', (_event, payload) => {
  window.dispatchEvent(new CustomEvent('scan.worker', { detail: payload }))
})
