import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import { app } from 'electron'
import Store, { type Schema } from 'electron-store'
import { Config, ConfigKey, ConfigValue, configDefaults } from '@shared/types'
import schema from './schema.json' assert { type: 'json' }

const appDataPath = path.join(app.getPath('appData'), '.vpm')
const imagesPath = path.join(appDataPath, 'images')
const dbPath = path.join(appDataPath, 'vpm.db')

if (!fs.existsSync(appDataPath)) {
  fs.mkdirSync(appDataPath, { recursive: true })
}

configDefaults.url.images = url.pathToFileURL(imagesPath).toString()
configDefaults.url.db = url.pathToFileURL(dbPath).toString()

const storeSchema = schema.properties as Schema<Config>

class ConfigService extends Store<Config> {
  get<T extends ConfigValue>(key: ConfigKey): T {
    return super.get(key as string) as T
  }

  // @ts-ignore: The type from electron-store is mostly
  // wrong (doesn't support multi-level keys). In fact, the
  // only reason this class exists is to give us better types.
  set(key: ConfigKey, value: ConfigValue): void {
    super.set(key, value)
  }
}

export default new ConfigService({ schema: storeSchema })
