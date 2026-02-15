import { fs, path, pathToFileURL } from '~/core/node.ts'
import { MainLogger } from '~/logger/index.ts'
import { LibSQLDatabase, drizzle } from './drizzle.ts'
import { Client, createClient } from './libsql.ts'
import { runMigrations } from './migrations.ts'

interface DatabaseConnection extends Disposable {
  db: LibSQLDatabase | null
  url: string | null
  client: Client | null
}

const databaseConnection: DatabaseConnection = {
  db: null,
  url: null,
  client: null,
  [Symbol.dispose]() {
    this.client?.close()
    this.client = null
    this.db = null
  },
}

export default async function connect(
  directory: string,
  log: MainLogger,
): Promise<DatabaseConnection> {
  if (databaseConnection.db && databaseConnection.client) {
    return databaseConnection
  }

  const dbPath = path.join(directory, 'vpm.db')
  const dbURL = pathToFileURL(dbPath)

  await fs.promises.mkdir(path.dirname(dbPath), {
    recursive: true,
  })

  log.info(`Using database file: "${dbURL}"`)

  databaseConnection.client = createClient({
    url: dbURL.href,
  })

  databaseConnection.db = drizzle(databaseConnection.client)
  databaseConnection.url = dbURL.href

  // await runMigrations(databaseConnection.client, log)

  return databaseConnection
}
