import { HubPackage, Package } from './'
import Config from './Config'

export const IpcEvent = {
  log: {
    info: 'log:info',
    warn: 'log:warn',
    err: 'log:err',
  },
  config: {
    get: 'config:get',
    set: 'config:set',
  },
  dialog: {
    openDirectory: 'dialog:openDirectory',
  },
  scan: {
    start: 'scan:start',
    stop: 'scan:stop',
    progress: 'scan:progress',
    import: 'scan:import',
    error: 'scan:error',
    abort: 'scan:abort',
  },
  packages: {
    get: 'packages:get',
    delete: 'packages:delete',
  },
  hub: {
    get: 'hub:get',
    find: 'hub:find',
    detail: 'hub:detail',
  },
}

export type ApiEvent =
  | `log:${keyof typeof IpcEvent.log}`
  | `config:${keyof typeof IpcEvent.config}`
  | `scan:${keyof typeof IpcEvent.scan}`
  | `packages:${keyof typeof IpcEvent.packages}`
  | `hub:${keyof typeof IpcEvent.hub}`

export default interface Api {
  selectFolder: () => Promise<string>
  getConfig: () => Promise<Config>
  setConfig: (config: Partial<Config>) => Promise<Config>
  scan: () => Promise<void>
  abortScan: () => void
  getPackages: (take?: number, skip?: number) => Promise<Package[]>
  deletePackage: (id: string) => Promise<void>
  hub: {
    get: (take?: number, skip?: number) => Promise<HubPackage[]>
    find: (...ids: string[]) => Promise<HubPackage | undefined>
    detail: (id: string) => Promise<HubPackage | undefined>
  }
  on: <T = never>(
    event: ApiEvent,
    callback: (event: unknown, ...args: T[]) => void
  ) => void
}
