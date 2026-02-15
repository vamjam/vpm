import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { Client, createClient } from '@libsql/client'
import { LibSQLDatabase, drizzle } from 'drizzle-orm/libsql'
import fileEntryCache, { FileEntryCache } from 'file-entry-cache'
import { assets, dependencies } from '@shared/entities.ts'
import { findFilesByExtension } from './fs.ts'
import { FileDescriptorWithMeta, PendingRecord } from './types.ts'

const dbRef = {
  db: null as LibSQLDatabase | null,
  client: null as Client | null,
}

export type ScanOptions = {
  cacheName: string
  vamPath: string
  dbPath: string
  batchSize: number
}

export default class Scanner {
  #rootDir: string
  #dbPath: string

  #cache: FileEntryCache

  #pendingRecords: PendingRecord[] = []
  #pendingDescriptors: FileDescriptorWithMeta[] = []
  #batchSize: number

  constructor(options: ScanOptions) {
    this.#dbPath = options.dbPath
    this.#rootDir = path.resolve(options.vamPath)
    this.#cache = fileEntryCache.create(
      options.cacheName,
      path.dirname(options.dbPath),
      {
        cwd: options.vamPath,
      },
    )
    this.#batchSize = options.batchSize
  }

  get #db() {
    if (dbRef.db) return dbRef.db

    dbRef.client = createClient({ url: pathToFileURL(this.#dbPath).href })
    dbRef.db = drizzle(dbRef.client)

    return dbRef.db
  }

  find(dir: string, ext: string) {
    return findFilesByExtension(this.resolve(dir), ext)
  }

  resolve(...paths: string[]) {
    return path.join(this.#rootDir, ...paths)
  }

  async scan(
    scanFolder: string,
    scanExt: string,
    onEachFile: (
      filePath: string,
      relativePath: string,
    ) => Promise<PendingRecord[] | undefined>,
  ) {
    const files = await this.find(scanFolder, scanExt)
    const total = files.length

    for await (const file of files) {
      const index = files.indexOf(file)
      const pct = Math.round(index + (1 / total) * 100)
      const fmtPct = pct.toString().padStart(3, ' ')

      console.log(
        JSON.stringify({ type: 'scan.pct', folder: scanFolder, pct: fmtPct }),
      )

      const relativePath = path.relative(this.resolve(scanFolder), file)
      const descriptor = this.#cache.getFileDescriptor(
        relativePath,
      ) as FileDescriptorWithMeta

      if (!descriptor.changed && descriptor.meta.data?.imported) {
        continue
      }

      const records = await onEachFile(file, relativePath)

      if (records) {
        this.#pendingRecords.push(...records)
        this.#pendingDescriptors.push(descriptor)
      }

      if (this.#pendingRecords.length >= this.#batchSize) {
        await this.#flush()
      }
    }

    await this.#flush()
  }

  async #flush() {
    if (!this.#pendingRecords.length) return

    const pendingAssets = this.#pendingRecords.map((record) => {
      const { dependencies: _dependencies, ...asset } = record
      return asset
    })

    const pendingDependencies = this.#pendingRecords.map((record) => {
      return [...new Set(record.dependencies ?? [])]
    })

    await this.#db.transaction(async (tx) => {
      const insertedAssets = await tx
        .insert(assets)
        .values(pendingAssets)
        .returning({ id: assets.id })

      const dependencyRows = insertedAssets.flatMap((asset, index) =>
        pendingDependencies[index].map((dependencyURL) => ({
          assetId: asset.id,
          dependencyURL,
        })),
      )

      if (dependencyRows.length) {
        await tx
          .insert(dependencies)
          .values(dependencyRows)
          .onConflictDoNothing()
      }
    })

    for (const descriptor of this.#pendingDescriptors) {
      descriptor.meta.data = {
        ...(descriptor.meta.data ?? {}),
        imported: true,
      }
    }

    this.#pendingRecords = []
    this.#pendingDescriptors = []

    this.#cache.reconcile()

    pendingAssets.length = 0
    pendingDependencies.length = 0
  }

  close() {
    dbRef.client?.close()

    dbRef.client = null
    dbRef.db = null
  }
}
