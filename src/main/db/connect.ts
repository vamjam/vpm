import { DataSource } from 'typeorm'
import { DB_DIR } from '@shared/config'
import * as entities from '@shared/entities'
import logger from '@shared/logger'

const log = logger('db/connect')

export const client = new DataSource({
  type: 'sqlite',
  database: DB_DIR,
  entities: Object.values(entities),
  synchronize: true,
})

const start = async () => {
  await client.initialize()
}

start()
  .then(() => log.debug('Database connected'))
  .catch((err) => log.error('Unknown error', err))

export default function connect() {
  return client
}
