import { app } from '~/core/electron.ts'
import { expose } from '~/core/service.ts'
import ConfigStore, { Config, ConfigKey } from './ConfigStore.ts'
import schema from './schema.json' with { type: 'json' }
import { ConfigSchema } from './schema.ts'

export class ConfigService {
  #store: ConfigStore
  path: string

  constructor() {
    const {
      properties,
      type,
      required,
      additionalProperties,
      definitions,
      ...rest
    } = schema

    this.#store = new ConfigStore({
      projectName: 'vpm',
      projectSuffix: '',
      rootSchema: {
        type,
        required,
        additionalProperties,
        definitions,
      },
      schema: properties,
      // @ts-expect-error: Other defaults live in the schema
      // as they are not dynamic
      defaults: {
        'data.path': app.getPath('userData'),
      },
    })

    this.path = this.#store.path
  }

  getStore(): ConfigSchema {
    return this.#store.store
  }

  @expose('config.get')
  get<K extends ConfigKey>(key: K): Config[K] {
    return this.#store.get(key)
  }

  @expose('config.set')
  set<K extends ConfigKey>(key: K, value: Config[K]): void {
    return this.#store.set(key, value)
  }
}
