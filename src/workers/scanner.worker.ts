import fsp from 'node:fs/promises'
import { availableParallelism } from 'node:os'
import path from 'node:path'
import AdmZip from 'adm-zip'
import { eq } from 'drizzle-orm'
import fileEntryCache, {
  FileDescriptor,
  FileEntryCache,
} from 'file-entry-cache'
import AssetType, { assetTypesMap } from '@shared/AssetType.ts'
import { Asset, assetErrors, assets } from '@shared/entities.ts'
import DBSession from './DBSession.ts'
import { parseDependencies } from './Dependency.ts'
import Manifest from './Manifest.ts'
import { sendMessage } from './Message.ts'
import assetTypeMap, { AssetMeta } from './assettype.map.ts'
import { findFilesByExtension } from './fs.ts'
import { parseArgs, parseFileName, parseName } from './parse.ts'

type FileDescriptorWithMeta = FileDescriptor & {
  meta: {
    data?: {
      imported?: boolean
    }
  }
}

const BATCH_SIZE = 200
const DEEP_SCAN_CONCURRENCY = availableParallelism()

const { dbPath, dir } = parseArgs()

const dbSession = new DBSession(dbPath)
const db = dbSession.acquire()

try {
  await shallowScan()
  await deepScan()
} catch (e) {
  console.error((e as Error)?.message)
} finally {
  dbSession.release()
  process.exit(0)
}

// ── Phase 1: Shallow scan ─────────────────────────────────────────────────────
// Discovers files on disk, skips already-imported unchanged files,
// and upserts new asset records in batches.

async function shallowScan() {
  sendMessage('shallow.start')

  const cache = fileEntryCache.create('scanner', path.dirname(dbPath), {
    cwd: dir,
  })

  const total = Object.keys(assetTypeMap).length
  let current = 0

  for await (const [assetType, meta] of Object.entries(assetTypeMap) as [
    AssetType,
    AssetMeta,
  ][]) {
    current += 1

    // Don't scan realtime assets
    if (meta.realtime) {
      continue
    }

    const files = await findAssetFiles(dir, meta)
    const len = files.length

    const records: (typeof assets.$inferInsert)[] = []
    const descriptors: FileDescriptorWithMeta[] = []
    let lastPct = 0

    for (let i = 0; i < len; i++) {
      try {
        const pct = Math.round(((current - 1 + i / len) / total) * 100)

        if (pct > lastPct) {
          sendMessage('shallow.progress', {
            value: pct,
            assetType: assetTypesMap[assetType],
          })

          lastPct = pct
        }

        if (!cache.getFileDescriptor(files[i]).changed) {
          continue
        }
        await collectFile(files[i], records, descriptors, cache, assetType)
      } catch (e) {
        await saveAssetError(files[i], 'shallow.scan', e as Error)

        sendMessage('error', {
          message: `Failed to parse ${files[i]}: ${(e as Error)?.message}`,
        })
      }

      const isLast = i === files.length - 1
      if (records.length >= BATCH_SIZE || (isLast && records.length > 0)) {
        await flush(records, descriptors, cache)
      }
    }
  }

  sendMessage('shallow.complete')
}

// ── Phase 2: Deep scan ────────────────────────────────────────────────────────
// Enriches imported assets with dependency and scene data
// extracted from vars.
// Skips assets that have already been deep-scanned (dependencies already set).
// Runs with bounded concurrency to avoid opening too many
// vars at once.

async function deepScan() {
  sendMessage('deep.start')

  const deepScanHandlers = createDeepScanHandlers()
  const pending = await db
    .select()
    .from(assets)
    .where(eq(assets.type, AssetType.AddonPackage))
  const len = pending.length
  let counter = 0
  let lastPct = 0

  await withConcurrency(pending, DEEP_SCAN_CONCURRENCY, async (asset) => {
    counter += 1
    const pct = Math.round((counter / len) * 100)

    if (pct > lastPct) {
      sendMessage('deep.progress', {
        value: pct,
      })

      lastPct = pct
    }

    const handler =
      deepScanHandlers[asset.type as keyof typeof deepScanHandlers]

    if (!handler) return

    try {
      await handler(asset)
    } catch (e) {
      await saveAssetError(asset.path, 'deep.scan', e as Error)

      sendMessage('error', {
        message: `Deep scan failed for ${asset.path}: ${(e as Error)?.message}`,
      })
    }
  })

  sendMessage('deep.complete')
}

async function collectFile(
  filePath: string,
  records: (typeof assets.$inferInsert)[],
  descriptors: FileDescriptorWithMeta[],
  cache: FileEntryCache,
  assetType: AssetType,
) {
  const relativePath = path.relative(dir, filePath)
  const descriptor = cache.getFileDescriptor(
    relativePath,
  ) as FileDescriptorWithMeta

  if (!descriptor.changed && descriptor.meta.data?.imported) return

  const name = parseName(assetType, filePath)

  if (!name) {
    sendMessage('error', {
      message: `Unable to parse name for ${relativePath}`,
    })
    return
  }

  const stats = await fsp.stat(filePath)
  const asset: typeof assets.$inferInsert = {
    name,
    type: assetType,
    path: relativePath,
    size: stats.size,
    createdAt: stats.birthtime,
    updatedAt: stats.mtime,
  }

  if (assetType === AssetType.AddonPackage) {
    const parsed = parseFileName(filePath)

    if (parsed) {
      asset.vamid = parsed.vamid
      asset.creator = parsed.creatorName
      asset.name = parsed.packageName
    }
  }

  records.push(asset)
  descriptors.push(descriptor)
}

async function flush(
  records: (typeof assets.$inferInsert)[],
  descriptors: FileDescriptorWithMeta[],
  cache: FileEntryCache,
) {
  await db.insert(assets).values(records).onConflictDoNothing()

  for (const descriptor of descriptors) {
    descriptor.meta.data = { ...(descriptor.meta.data ?? {}), imported: true }
  }

  cache.reconcile()
  records.length = 0
  descriptors.length = 0
}

async function findAssetFiles(root: string, meta: AssetMeta) {
  const files: string[] = []
  for await (const subDir of meta.paths) {
    for await (const ext of meta.exts) {
      files.push(...(await findFilesByExtension(path.join(root, subDir), ext)))
    }
  }
  return files
}

function createDeepScanHandlers() {
  return {
    async [AssetType.AddonPackage](asset: Asset) {
      const zip = new AdmZip(path.join(dir, asset.path))
      const meta = parseMeta(zip)
      const deps = parseDependencies(meta?.dependencies)

      await db
        .update(assets)
        .set({ dependencies: deps, description: meta?.description })
        .where(eq(assets.id, asset.id))

      const sceneEntries = zip
        .getEntries()
        .filter(
          (e) =>
            e.entryName.startsWith('Saves/scene') &&
            e.entryName.endsWith('.json'),
        )

      const parsed = (
        await Promise.all(
          sceneEntries.map((entry) => {
            const stats = {
              size: entry.header.size,
              createdAt: entry.header.time ?? new Date(),
            }

            const path = entry.entryName.replaceAll('/', '\\')
            const name = parseName(AssetType.Scene, entry.name)

            const data: typeof assets.$inferInsert = {
              name,
              type: AssetType.Scene,
              path,
              parentId: asset.id,
              ...stats,
            }

            return data
          }),
        )
      ).filter(Boolean)

      if (parsed.length > 0) {
        await db.insert(assets).values(parsed).onConflictDoNothing()
      }
    },
  }
}

// ── Utilities ─────────────────────────────────────────────────────────────────

async function saveAssetError(filePath: string, event: string, e?: Error) {
  const data: typeof assetErrors.$inferInsert = {
    path: filePath,
    event,
    message: e?.message ?? 'Unknown error',
  }

  await db.insert(assetErrors).values([data])
}

function parseMeta(zip: AdmZip) {
  try {
    const manifestEntry = zip.getEntry('meta.json')
    const meta = JSON.parse(
      manifestEntry?.getData().toString('utf8') ?? '{}',
    ) as Manifest

    return meta
  } catch (error) {
    console.error(`Failed to parse meta.json:`, (error as Error)?.message)

    return
  }
}

async function withConcurrency<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>,
) {
  const queue = [...items]
  const workers = Array.from(
    { length: Math.min(limit, queue.length) },
    async () => {
      while (queue.length > 0) {
        await fn(queue.shift()!)
      }
    },
  )
  await Promise.all(workers)
}
