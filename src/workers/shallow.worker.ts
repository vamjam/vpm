import fsp from 'node:fs/promises'
import path from 'node:path'
import fileEntryCache, { FileEntryCache } from 'file-entry-cache'
import AssetType from '@shared/AssetType.ts'
import { assets } from '@shared/entities.ts'
import DBSession from './DBSession.ts'
import { FileDescriptorWithMeta } from './Scanner.ts'
import assetTypeMap, { AssetMeta, presetTypes } from './assettype.map.ts'
import { findFilesByExtension } from './fs.ts'
import { parseArgs, parseFileName } from './utils.ts'

const BATCH_SIZE = 200

const { dbPath, dir } = parseArgs()

const dbSession = new DBSession(dbPath)
const db = dbSession.acquire()

try {
  await scanAssets()
} catch (e) {
  console.error((e as Error)?.message)
}

dbSession.release()

process.exit(0)

async function scanAssets() {
  const cache = fileEntryCache.create('shallow', path.dirname(dbPath), {
    cwd: dir,
  })

  for await (const [assetType, meta] of Object.entries(assetTypeMap) as [
    AssetType,
    AssetMeta,
  ][]) {
    const files = await findAssetFiles(dir, meta)
    const descriptors: FileDescriptorWithMeta[] = []
    const data: (typeof assets.$inferInsert)[] = []

    console.log(`Found ${files.length} files for ${meta.displayName}...`)

    for await (const filePath of files) {
      try {
        await parseFile(
          filePath,
          data,
          descriptors,
          cache,
          assetType,
          files.indexOf(filePath),
          files.length,
        )
      } catch (e) {
        console.error((e as Error)?.message)
      }
    }
  }
}

async function parseFile(
  filePath: string,
  records: (typeof assets.$inferInsert)[],
  descriptors: FileDescriptorWithMeta[],
  cache: FileEntryCache,
  assetType: AssetType,
  index: number,
  filesLength: number,
) {
  const relativePath = path.relative(dir, filePath)
  const descriptor = cache.getFileDescriptor(
    relativePath,
  ) as FileDescriptorWithMeta

  if (!descriptor.changed && descriptor.meta.data?.imported) {
    return
  }

  const name = parseName(assetType, filePath)

  if (!name) {
    console.error(`Unable to parse ${relativePath} (unable to parse file name)`)

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
    const parsedFileName = parseFileName(filePath)

    if (parsedFileName) {
      asset.vamid = parsedFileName.vamid
      asset.creator = parsedFileName.creatorName
      asset.name = parsedFileName.packageName
    }
  }

  records.push(asset)
  descriptors.push(descriptor)

  if (records.length >= BATCH_SIZE || index === filesLength - 1) {
    await db.insert(assets).values(records)

    for (const descriptor of descriptors) {
      descriptor.meta.data = {
        ...(descriptor.meta.data ?? {}),
        imported: true,
      }
    }

    cache.reconcile()

    records.length = 0
    descriptors.length = 0
  }
}

async function findAssetFiles(root: string, meta: AssetMeta) {
  const files: string[] = []

  for await (const dir of meta.paths) {
    for await (const ext of meta.exts) {
      files.push(...(await findFilesByExtension(path.join(root, dir), ext)))
    }
  }

  return files
}

function parseName(assetType: AssetType, filePath: string) {
  if (presetTypes.includes(assetType as AssetType)) {
    return path.basename(filePath, '.vap').replace('Preset_', '')
  }

  return path.basename(filePath).replace(/\.[^/.]+$/, '')
}
