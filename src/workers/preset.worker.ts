import fsp from 'node:fs/promises'
import path from 'node:path'
import AdmZip from 'adm-zip'
import { addons } from '@shared/entities.ts'
import Manifest, { ManifestDependency } from './Manifest.ts'
import Scanner from './Scanner.ts'
import { parseArgs, parseFileName } from './utils.ts'

const { dbPath, dir } = parseArgs()

const addonScanner = new Scanner<typeof addons.$inferInsert>({
  batchSize: 50,
  cacheName: 'addons',
  dbPath,
  vamPath: dir,
  scanFolders: ['AddonPackages'],
  scanExts: ['.var'],
  enqueue: async (filePath, relativePath) => {
    const parsedFileName = parseFileName(filePath)

    if (!parsedFileName?.creatorName) return

    const zip = new AdmZip(filePath)
    const manifest = zip.getEntry('meta.json')?.getData().toString('utf8')
    const meta = JSON.parse(manifest ?? '{}') as Manifest
    const stats = await fsp.stat(filePath)
    const dependencies = getAllDependencies(meta.dependencies)
    const fileName = path.basename(filePath, '.var')

    const pkg: typeof addons.$inferInsert = {
      id: fileName,
      creator: parsedFileName.creatorName,
      name: parsedFileName.packageName,
      path: relativePath,
      size: stats.size,
      dependencies,
      version: parsedFileName.version,
      createdAt: stats.birthtime,
      updatedAt: stats.mtime,
    }

    return [pkg]
  },
  flush: async (db, pendingRecords) => {
    await db.insert(addons).values(pendingRecords)
  },
})

await addonScanner.scan()

addonScanner.close()

process.exit(0)

function getAllDependencies(data?: Record<string, ManifestDependency>) {
  if (!data || Object.keys(data).length === 0) return []

  const deps: string[] = []

  for (const dep of Object.keys(data)) {
    deps.push(dep)

    if (data[dep].dependencies) {
      deps.push(
        ...getAllDependencies(
          data[dep].dependencies as Record<string, ManifestDependency>,
        ),
      )
    }
  }

  return deps
}
