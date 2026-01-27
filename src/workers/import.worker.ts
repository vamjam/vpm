import { promises as fsp } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { AssetType, assets } from '@shared/entities.ts'
import fileEntryCache, { FileDescriptor } from 'file-entry-cache'
import { createDB, parseArgs } from './api.ts'
import { assetPathMap } from './asset-path.map.ts'

const args = parseArgs()

const { db, client } = createDB(args.dbPath)

try {
  if (!('dir' in args) || !args.dir) {
    throw new Error('No directory to import from')
  }

  if (!('dbPath' in args) || !args.dbPath) {
    throw new Error('No database path')
  }

  const { dir, dbPath } = args

  const rootDir = path.resolve(dir)

  const cacheDir = path.join(path.dirname(dbPath), '.vpm-cache')
  const cache = fileEntryCache.create('finder', cacheDir, {
    cwd: rootDir,
    useCheckSum: true,
  })

  type NewAsset = typeof assets.$inferInsert
  const pendingAssets: NewAsset[] = []
  const pendingDescriptors: ReturnType<typeof cache.getFileDescriptor>[] = []

  for (const [assetType, meta] of Object.entries(assetPathMap)) {
    for (const dirPath of meta.paths) {
      const scanRoot = path.join(rootDir, dirPath)

      for await (const filePath of walkFiles(scanRoot, meta.exts)) {
        const relativePath = path.relative(rootDir, filePath)
        const descriptor = cache.getFileDescriptor(
          relativePath,
        ) as FileDescriptor & {
          meta: {
            data?: {
              imported?: boolean
            }
          }
        }

        if (!descriptor.changed && descriptor.meta.data?.imported) {
          continue
        }

        const stats = await fsp.stat(filePath)

        pendingAssets.push({
          fileCreatedAt: stats.birthtime,
          fileUpdatedAt: stats.mtime,
          fileName: path.basename(filePath),
          fileSize: stats.size,
          type: assetType as AssetType,
          url: pathToFileURL(filePath).href,
        })

        pendingDescriptors.push(descriptor)
      }
    }
  }

  if (pendingAssets.length) {
    await db.insert(assets).values(pendingAssets).onConflictDoNothing()

    for (const descriptor of pendingDescriptors) {
      descriptor.meta.data = {
        ...(descriptor.meta.data ?? {}),
        imported: true,
      }
    }
  }

  cache.reconcile()
} catch (err) {
  console.error((err as Error)?.message)
} finally {
  client.close()

  process.exit(0)
}

async function* walkFiles(
  dirPath: string,
  exts: string[],
): AsyncGenerator<string> {
  let entries: Array<import('node:fs').Dirent>

  try {
    entries = await fsp.readdir(dirPath, { withFileTypes: true })
  } catch {
    return
  }

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)

    if (entry.isDirectory()) {
      yield* walkFiles(fullPath, exts)

      continue
    }

    if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase()
      if (!exts.includes(ext)) {
        continue
      }

      yield fullPath
    }
  }
}
