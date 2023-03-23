import { contextBridge } from 'electron'
import api from '@shared/api'

contextBridge.exposeInMainWorld('api', api)
