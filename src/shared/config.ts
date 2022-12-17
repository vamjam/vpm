import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
// import { pathToFileURL } from 'node:url'
import { app } from 'electron'

const {
  NODE_ENV,
  LOG_FILE_LEVEL,
  LOG_FILE_NAME,
  LOG_CONSOLE_LEVEL,
  DATA_DIR_NAME,
  DB_NAME,
} = process.env as {
  NODE_ENV: 'production' | string
  LOG_FILE_LEVEL: string
  LOG_FILE_NAME: string
  LOG_CONSOLE_LEVEL: string
  DATA_DIR_NAME: string
  DB_NAME: string
}

export { LOG_CONSOLE_LEVEL, LOG_FILE_LEVEL }

export const IS_DEV = NODE_ENV !== 'production'
export const LOG_DIR = app.getPath('logs')
export const LOG_FILE = path.join(LOG_DIR, LOG_FILE_NAME)

export const DATA_DIR = path.join(app.getPath('cache'), DATA_DIR_NAME)
export const IMAGES_DIR = path.join(DATA_DIR, 'images')
export const DB_DIR = path.join(DATA_DIR, DB_NAME)
// export const IMAGES_URL = pathToFileURL(
//   path.join(DATA_DIR, 'images')
// ).toString()
// export const DB_URL = pathToFileURL(path.join(DATA_DIR, DB_NAME)).toString()

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

console.log('CONFIG', {
  IS_DEV,
  LOG_DIR,
  LOG_FILE,
  LOG_CONSOLE_LEVEL,
  LOG_FILE_LEVEL,
  DATA_DIR,
  IMAGES_DIR,
  DB_DIR,
})
