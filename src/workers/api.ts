import { pathToFileURL } from 'node:url'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'

export function parseArgs(): Record<string, string> {
  const args = process.argv.slice(2)
  const parsedArgs = args.reduce<Record<string, string>>((acc, arg) => {
    const [key, value] = arg.split('=')
    acc[key.replace(/^--/, '')] = value || ''
    return acc
  }, {})

  console.log('Worker initialized with args:', parsedArgs)

  return parsedArgs
}

export function createDB(dbPath: string) {
  const dbURL = pathToFileURL(dbPath)

  const client = createClient({
    url: dbURL.href,
  })

  return {
    db: drizzle(client),
    client,
  }
}
