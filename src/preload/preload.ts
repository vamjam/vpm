// import { createAPI } from '@shared/api.ts'
import { contextBridge, ipcRenderer } from 'electron'

// const api = createAPI(ipcRenderer)

contextBridge.exposeInMainWorld('api', {
  test: () => ipcRenderer.invoke('test'),
})
