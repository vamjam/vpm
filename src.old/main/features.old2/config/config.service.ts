import Store from 'electron-store'
import logger from '@shared/logger'
import { Config, ConfigKey, ConfigValue, configSchema } from '@shared/types'
import IpcService from '~/utils/IpcService'

const log = logger('config.service')

const config = new Store<Config>({ schema: configSchema })

type ConfigServiceEvents = {
  'config:change': (key: ConfigKey, value: ConfigValue) => void
}

type ConfigServiceActions = {
  'config:get': () => Config
  'config:set': (key?: ConfigKey, value?: ConfigValue) => void
}

class ConfigService
  extends IpcService<ConfigServiceEvents>
  implements ConfigServiceActions
{
  ['config:get']() {
    return config.store
  }

  ['config:set'](key?: ConfigKey, value?: ConfigValue) {
    try {
      if (key && value) {
        config.set(key, value)

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

export default Object.assign({}, new ConfigService(), config)
