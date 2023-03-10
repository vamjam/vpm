import fs from 'node:fs'
import knex from 'knex'
import { fileURLToPath } from 'url'
import * as Entity from '@shared/entities'
import { config } from '~/config'
import logger from '~/logger'
import seed from './seed'

const log = logger('db.client')

const dbURL = new URL(config.get('db.url'))
const dbFilePath = fileURLToPath(dbURL)

const config = knex({
  client: 'sqlite3',
  useNullAsDefault: true,
  connection: {
    filename: dbFilePath,
  },
})

if (!fs.existsSync(dbFilePath)) {
  log.info(`Creating database at ${dbURL}`)

  seed(config).then(() => {
    log.info(`Database created!`)
  })
} else {
  log.info(`Connecting to database at ${dbURL}`)
}

// Gives us a slightly nicer API to work with
const client = Object.assign(config, {
  Addon: config<Entity.Addon>('addons'),
  Asset: config<Entity.Asset>('assets'),
  AddonAsset: config<Entity.AddonAsset>('addon_assets'),
  Creator: config<Entity.Creator>('creators'),
  Dependency: config<Entity.Dependency>('dependencies'),
  Image: config<Entity.Image>('images'),
})

log.info(`Database connected!`)

export default client
