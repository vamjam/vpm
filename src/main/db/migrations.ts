import { app } from '~/core/electron.ts'
import { fsp, path } from '~/core/node.ts'
import { MainLogger } from '~/logger/index.ts'
import { Client } from './libsql.ts'

export async function runMigrations(client: Client, log: MainLogger) {
  const migrationDir = path.resolve(app.getAppPath(), 'drizzle')
  const fileNames = await fsp.readdir(migrationDir)
  const sqlFileNames = fileNames.filter((f) => f.endsWith('.sql'))

  for await (const sqlFileName of sqlFileNames) {
    log.info(`Running migration: ${sqlFileName}`)
    const fullPath = path.join(migrationDir, sqlFileName)
    const sql = await fsp.readFile(fullPath, 'utf8')

    await client.executeMultiple(sql)
    await fsp.unlink(fullPath)
    log.info(`Deleted migration: ${sqlFileName}`)
  }
}
