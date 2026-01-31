import { promises as fsp } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import fileEntryCache, { FileDescriptor } from 'file-entry-cache'
import AssetType, { AssetTypeDisplayNameMap } from '@shared/AssetType.ts'
import { assets } from '@shared/entities.ts'
import { createDB, parseArgs } from './api.ts'
import assetTypePathMap from './assetTypePathMap.ts'

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
  const cacheDir = path.join(path.dirname(dbPath))
  const cache = fileEntryCache.create('scanner', cacheDir, {
    cwd: rootDir,
    useCheckSum: true,
  })

  console.log(`Using cache directory: ${cacheDir}`)
  console.log(`Scanning ${rootDir} for assets...`)

  const pendingAssets: (typeof assets.$inferInsert)[] = []
  const pendingDescriptors: ReturnType<typeof cache.getFileDescriptor>[] = []
  const batchSize = 50

  const flushBatch = async () => {
    if (!pendingAssets.length) return

    console.log(`Importing ${pendingAssets.length} assets...`)

    await db.insert(assets).values(pendingAssets).onConflictDoNothing()

    for (const descriptor of pendingDescriptors) {
      descriptor.meta.data = {
        ...(descriptor.meta.data ?? {}),
        imported: true,
      }
    }

    pendingAssets.length = 0
    pendingDescriptors.length = 0

    cache.reconcile()
  }

  for (const [assetType, meta] of Object.entries(assetTypePathMap)) {
    const assetTypeDisplayName = AssetTypeDisplayNameMap[assetType as AssetType]

    for (const dirPath of meta.paths) {
      const scanRoot = path.join(rootDir, dirPath)

      console.log(`Scanning ${scanRoot} for ${assetTypeDisplayName}`)

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
          console.log(`Skipping ${assetTypeDisplayName}: ${relativePath}`)

          continue
        }

        const stats = await fsp.stat(filePath)
        const fileName = path.basename(filePath)

        console.log(`Found ${assetTypeDisplayName}: ${fileName}`)

        pendingAssets.push({
          fileCreatedAt: stats.birthtime,
          fileUpdatedAt: stats.mtime,
          fileName,
          fileSize: stats.size,
          type: assetType as AssetType,
          url: pathToFileURL(filePath).href,
        })

        pendingDescriptors.push(descriptor)

        if (pendingAssets.length >= batchSize) {
          await flushBatch()
        }
      }
    }
  }

  await flushBatch()
} catch (err) {
  console.error((err as Error)?.message)
} finally {
  console.log(`Shutting down worker...`)

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
