import fs from 'node:fs'
// import path from 'node:path'
import knex from 'knex'
// import sqlite from 'sqlite3'
import { fileURLToPath } from 'url'
import * as Entity from '@shared/entities'
import config from '~/config'
import logger from '~/logger'
import seed from './seed'

const log = logger('db.client')

const dbURL = new URL(config.get('db.url'))
const dbFilePath = fileURLToPath(dbURL)

log.info(`Connecting to database at ${dbURL}`)

const knexConfig = knex({
  client: 'sqlite3',
  useNullAsDefault: true,
  connection: {
    filename: dbFilePath,
  },
})

if (!fs.existsSync(dbFilePath)) {
  log.info(`Creating database...`)

  seed(knexConfig).then(() => {
    log.info(`Database created.`)
  })
} else {
  log.info(`Connecting to database...`)
}

// Gives us a slightly nicer API to work with
const client = Object.assign(knexConfig, {
  assets: () => knexConfig<Entity.Asset>('assets'),
  assetFiles: () => knexConfig<Entity.AssetFile>('asset_files'),
  creators: () => knexConfig<Entity.Creator>('creators'),
  dependencies: () => knexConfig<Entity.Dependency>('dependencies'),
  images: () => knexConfig<Entity.Image>('images'),
})

log.info(`Database connected!`)

export default client
