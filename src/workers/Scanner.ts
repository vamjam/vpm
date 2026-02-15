import path from 'node:path'
import { LibSQLDatabase } from 'drizzle-orm/libsql'
import fileEntryCache, {
  FileDescriptor,
  FileEntryCache,
} from 'file-entry-cache'
import DBSession from './DBSession.ts'
import { findFilesByExtension } from './fs.ts'

export type ScanOptions<T> = {
  cacheName: string
  vamPath: string
  dbPath: string
  batchSize: number
  scanFolders: string[]
  scanExts: string[]
  enqueue: (filePath: string, relativePath: string) => Promise<T[] | undefined>
  flush: (db: LibSQLDatabase, pendingRecords: T[]) => Promise<void>
}

export type FileDescriptorWithMeta = FileDescriptor & {
  meta: {
    data?: {
      imported?: boolean
    }
  }
}

export default class Scanner<T> {
  #vamPath: string
  #dbSession: DBSession
  #cache: FileEntryCache
  #pendingRecords: T[] = []
  #pendingDescriptors: FileDescriptorWithMeta[] = []

  #batchSize: number
  #scanFolders: string[]
  #scanExts: string[]

  flush: (db: LibSQLDatabase, pendingRecords: T[]) => Promise<void>
  enqueue: (filePath: string, relativePath: string) => Promise<T[] | undefined>

  constructor(options: ScanOptions<T>) {
    this.#vamPath = path.resolve(options.vamPath)
    this.#cache = fileEntryCache.create(
      options.cacheName,
      path.dirname(options.dbPath),
      {
        cwd: options.vamPath,
      },
    )
    this.#batchSize = options.batchSize
    this.enqueue = options.enqueue
    this.flush = options.flush
    this.#scanFolders = options.scanFolders
    this.#scanExts = options.scanExts

    this.#dbSession = new DBSession(options.dbPath)
  }

  async scan() {
    const db = this.#dbSession.acquire()

    for (const folder of this.#scanFolders) {
      for (const ext of this.#scanExts) {
        const files = await this.#find(folder, ext)
        const total = files.length

        for await (const file of files) {
          const index = files.indexOf(file)
          const pct = Math.round(index + (1 / total) * 100)
          const fmtPct = pct.toString().padStart(3, ' ')

          console.log(
            JSON.stringify({
              type: 'scan.pct',
              folder,
              pct: fmtPct,
            }),
          )

          const relativePath = path.relative(this.#resolve(folder), file)
          const descriptor = this.#cache.getFileDescriptor(
            relativePath,
          ) as FileDescriptorWithMeta

          if (!descriptor.changed && descriptor.meta.data?.imported) {
            continue
          }

          const records = await this.enqueue(file, relativePath)

          if (records) {
            this.#pendingRecords.push(...records)
            this.#pendingDescriptors.push(descriptor)
          }

          if (this.#pendingRecords.length >= this.#batchSize) {
            await this.#flush(db)
          }
        }
      }
    }

    await this.#flush(db)
  }

  close() {
    this.#dbSession.release()
  }

  async #flush(db: LibSQLDatabase) {
    if (!this.#pendingRecords.length) return

    await this.flush(db, this.#pendingRecords)

    for (const descriptor of this.#pendingDescriptors) {
      descriptor.meta.data = {
        ...(descriptor.meta.data ?? {}),
        imported: true,
      }
    }

    this.#cache.reconcile()

    this.#pendingRecords = []
    this.#pendingDescriptors = []
  }

  #find(dir: string, ext: string) {
    return findFilesByExtension(this.#resolve(dir), ext)
  }

  #resolve(dir: string, ...paths: string[]) {
    return path.join(this.#vamPath, dir, ...paths)
  }
}
