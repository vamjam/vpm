import { pathToFileURL } from 'node:url'
import { Client, createClient } from '@libsql/client'
import { LibSQLDatabase, drizzle } from 'drizzle-orm/libsql'

export default class DBSession {
  #refs = 0
  #dbPath: string
  #db: LibSQLDatabase | null = null
  #client: Client | null = null

  constructor(dbPath: string) {
    this.#dbPath = dbPath
  }

  acquire() {
    this.#client ??= createClient({ url: pathToFileURL(this.#dbPath).href })
    this.#db ??= drizzle(this.#client)

    this.#refs++

    return this.#db
  }

  release() {
    this.#refs--
    if (this.#refs === 0) {
      this.#client?.close()
    }
  }
}
