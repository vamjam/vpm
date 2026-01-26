import { contextBridge, ipcRenderer } from 'electron/renderer'
import { createAPI } from '@shared/api.ts'

const api = createAPI(ipcRenderer)

contextBridge.exposeInMainWorld('api', api)
