import fsp from 'node:fs/promises'
import path from 'node:path'
import AdmZip, { IZipEntry } from 'adm-zip'
import { scenes } from '@shared/entities.ts'
import { fromSceneFile, fromVarFileEntry } from './Dependency.ts'
import Scanner from './Scanner.ts'
import { parseArgs, parseFileName } from './utils.ts'

const { dbPath, dir } = parseArgs()

const myScenesScanner = new Scanner<typeof scenes.$inferInsert>({
  batchSize: 50,
  cacheName: 'scenes',
  dbPath,
  vamPath: dir,
  scanFolders: ['Saves/scene'],
  scanExts: ['.json'],
  enqueue: async (filePath, relativePath) => {
    const fileName = path.basename(filePath)
    const stats = await fsp.stat(filePath)
    const dependencies = (await fromSceneFile(filePath)).map(
      (d) => d.split(':')[0],
    )

    const scene: typeof scenes.$inferInsert = {
      name: fileName,
      path: relativePath,
      size: stats.size,
      createdAt: stats.birthtime,
      updatedAt: stats.mtime,
      dependencies,
      creator: 'SELF',
    }

    return [scene]
  },
  flush: async (db, pendingRecords) => {
    await db.insert(scenes).values(pendingRecords)
  },
})

const addonPackagesSceneScanner = new Scanner<typeof scenes.$inferInsert>({
  batchSize: 50,
  cacheName: 'scenes',
  dbPath,
  vamPath: dir,
  scanFolders: ['AddonPackages'],
  scanExts: ['.var'],
  enqueue: async (filePath, relativePath) => {
    const zip = new AdmZip(filePath)
    const zippedScenes = zip.getEntries().filter(isScene)
    const records: (typeof scenes.$inferInsert)[] = []
    const parsedFileName = parseFileName(filePath)

    if (!parsedFileName?.creatorName) {
      console.error(`Unable to parse ${relativePath}`)

      return
    }

    for (const scene of zippedScenes) {
      const name = path.basename(scene.entryName, '.json')

      const data: typeof scenes.$inferInsert = {
        name,
        path: `${relativePath}:${path.sep}${scene.entryName}`,
        size: scene.header.size,
        dependencies: fromVarFileEntry(scene),
        createdAt: scene.header.time,
        creator: parsedFileName.creatorName,
      }

      records.push(data)
    }

    return records
  },
  flush: async (db, pendingRecords) => {
    await db.insert(scenes).values(pendingRecords)
  },
})

await Promise.all([myScenesScanner.scan(), addonPackagesSceneScanner.scan()])

myScenesScanner.close()
addonPackagesSceneScanner.close()

process.exit(0)

function isScene(entry: IZipEntry) {
  return (
    entry.entryName.startsWith('Saves/scene') &&
    entry.entryName.endsWith('.json')
  )
}
