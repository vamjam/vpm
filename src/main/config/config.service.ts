import ConfigStore, { Config, ConfigKey } from './ConfigStore.ts'

export class ConfigService {
  #store: ConfigStore

  constructor() {
    this.#store = new ConfigStore()
  }

  getConfig(): ConfigStore {
    return this.#store
  }

  get<K extends ConfigKey>(key: K) {
    return this.#store.get(key)
  }

  set<K extends ConfigKey>(key: K, value: Config[K]) {
    return this.#store.set(key, value)
  }
}
