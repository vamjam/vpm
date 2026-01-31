import Conf from 'conf';
import schema from './schema.json' with { type: 'json' };
import { ConfigSchema } from './schema.ts';


export type ConfigKey = keyof ConfigSchema
export type Config = ConfigSchema

// The electron-store module requires escaping keys that
// contain dots, so this class simply wraps the store to do
// that for us. Now we can do `config.get('some.config.key')`
export default class ConfigStore extends Conf<ConfigSchema> {
  override get<K extends ConfigKey>(key: K): Config[K] {
    return super.get(escape(key))
  }

  override set<K extends ConfigKey>(key: K, value?: Config[K]): void {
    if (isReadonly(key)) {
      throw new Error(`Cannot set read-only config key: ${key}`)
    }

    return super.set(escape(key), value)
  }

  override has<K extends ConfigKey>(key: K): boolean {
    return super.has(escape(key) as keyof ConfigSchema)
  }
}

const readonlyKeys = Object.entries(schema.properties)
  .filter(([_, value]) => 'readOnly' in value && value.readOnly === true)
  .map(([key]) => key as ConfigKey)

const escape = (str: string) => str.replace(/[\\.[]/g, '\\$&')
const isReadonly = <K extends ConfigKey>(key: K) =>
  key === undefined || readonlyKeys.includes(key)