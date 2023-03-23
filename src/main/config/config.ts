import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'
import { app } from 'electron'
import Store, { type Schema as StoreSchema } from 'electron-store'
import { isNullOrEmpty } from '@shared/utils/String'
import Schema from './schema'
import schema from './schema.json' assert { type: 'json' }

const handleTrailingSlash = (url: URL) => {
  url.pathname += url.pathname.endsWith('/') ? '' : '/'

  return url
}

const APPDATA_URL = url.pathToFileURL(
  path.join(app.getPath('appData'), app.name)
)

if (!fs.existsSync(APPDATA_URL)) {
  fs.mkdirSync(APPDATA_URL, { recursive: true })
}

const withTrailingSlash = handleTrailingSlash(APPDATA_URL)
const IMAGES_URL = new URL('images', withTrailingSlash)
const LIBRARY_URL = new URL('library', withTrailingSlash)
const DB_URL = new URL(`${app.name}.db`, withTrailingSlash)
const LOGS_URL = url.pathToFileURL(
  path.join(app.getPath('logs'), `${app.name}.log`)
)

const { LOG_FILE_LEVEL, LOG_CONSOLE_LEVEL } = process.env as {
  LOG_FILE_LEVEL: Schema['logs.file.level']
  LOG_CONSOLE_LEVEL: Schema['logs.console.level']
}

// Because I want the JSON Schema to be, you know, JSON, we
// need to define valid defaults for required fields here.
// Otherwise the horseshit won't work.
schema.properties['db.url'].default = DB_URL.toString()
schema.properties['library.url'].default = LIBRARY_URL.toString()
schema.properties['images.url'].default = IMAGES_URL.toString()
schema.properties['logs.url'].default = LOGS_URL.toString()

if (!isNullOrEmpty(LOG_FILE_LEVEL)) {
  schema.properties['logs.file.level'].default = LOG_FILE_LEVEL
}

if (!isNullOrEmpty(LOG_CONSOLE_LEVEL)) {
  schema.properties['logs.console.level'].default = LOG_CONSOLE_LEVEL
}

const store = new Store<Schema>({
  schema: schema.properties as StoreSchema<Schema>,
})

const escape = (str: string) => str.replace(/[\\.[]/g, '\\$&')

const config = {
  get<T extends keyof Schema>(key: T) {
    return store.get(escape(key)) as Schema[T]
  },
  set<T extends keyof Schema>(key: T, value: Schema[T]) {
    store.set(escape(key), value)
  },
}

export default config
