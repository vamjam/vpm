import fs from 'node:fs'
import knex from 'knex'
import { fileURLToPath } from 'url'
import * as entity from '@shared/entities'
import logger from '@shared/logger'
import { ConfigService } from '~/features/config'
import seed from './seed'

const log = logger('db.client')

const filename = fileURLToPath(ConfigService.get<string>('url.db'))

const config = knex({
  client: 'sqlite3',
  useNullAsDefault: true,
  connection: {
    filename,
  },
})

if (!fs.existsSync(filename)) {
  log.info(`Creating database at ${filename}`)

  seed(config).then(() => {
    log.info(`Database created!`)
  })
} else {
  log.info(`Connecting to database at ${filename}`)
}

// Gives us a slightly nicer API to work with
const client = Object.assign(config, {
  ActivePackage: config<entity.ActivePackage>('active_packages'),
  Creator: config<entity.Creator>('creators'),
  Image: config<entity.Image>('images'),
  Package: config<entity.Package>('packages'),
  PackageImage: config<entity.PackageImage>('package_images'),
  Source: config<entity.Source>('sources'),
  SourceDependency: config<entity.SourceDependency>('source_dependencies'),
})

log.info(`Database connected!`)

export default client
