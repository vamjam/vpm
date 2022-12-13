import { Config, ConfigKey, ConfigValue, Package } from '.'

export const APIEventMap = {
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
} as const

export type APIEvent =
  | `log:${keyof typeof APIEventMap.log}`
  | `config:${keyof typeof APIEventMap.config}`
  | `scan:${keyof typeof APIEventMap.scan}`
  | `packages:${keyof typeof APIEventMap.packages}`
  | `hub:${keyof typeof APIEventMap.hub}`

type API = {
  selectFolder: () => Promise<string>
  getConfig: () => Promise<Config>
  setConfig: (key?: ConfigKey, value?: ConfigValue) => Promise<Config>
  // scan: () => Promise<void>
  // abortScan: () => void
  // getPackages: (take?: number, skip?: number) => Promise<Package[]>
  // deletePackage: (id: string) => Promise<void>
  // hub: {
  //   get: (take?: number, skip?: number) => Promise<Package[]>
  //   find: (...ids: string[]) => Promise<Package | undefined>
  //   detail: (id: string) => Promise<Package | undefined>
  // }
  // on: <T = unknown>(
  //   event: APIEvent,
  //   callback: (event: unknown, ...args: T[]) => void
  // ) => void
}

export default API
