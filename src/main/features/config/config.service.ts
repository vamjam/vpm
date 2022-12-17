import Store from 'electron-store'
import logger from '@shared/logger'
import { Config, ConfigKey, ConfigValue, configSchema } from '@shared/types'
import IpcService from '~/lib/IpcService'

const log = logger('config.service')

export const configStore = new Store<Config>({ schema: configSchema })

export type ConfigServiceEvents = {
  'config:change': (key: ConfigKey, value: ConfigValue) => void
}

export type ConfigServiceActions = {
  'config:get': () => Config
  'config:set': (key?: ConfigKey, value?: ConfigValue) => void
}

class ConfigService
  extends IpcService<ConfigServiceEvents>
  implements ConfigServiceActions
{
  ['config:get']() {
    return configStore.store
  }

  ['config:set'](key?: ConfigKey, value?: ConfigValue) {
    try {
      if (key && value) {
        configStore.set(key, value)

        this.emit('config:change', key as ConfigKey, value as ConfigValue)
      }
    } catch (err) {
      log.error(
        `Error setting config key "${key}" with value "${value}"`,
        err as Error
      )
    }
  }
}

export default new ConfigService()
