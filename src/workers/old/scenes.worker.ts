import fsp from 'node:fs/promises'
import path from 'node:path'
import AdmZip, { IZipEntry } from 'adm-zip'
import AssetType, { getExt, getPath } from '@shared/AssetType.ts'
import { fromSceneFile } from './Dependency.ts'
import Scanner from './Scanner.ts'
import * as SceneParser from './SceneParser.ts'
import { Manifest, ManifestDependency, PendingRecord } from './types.ts'
import { parseArgs, parseFileName } from './utils.ts'

const { dbPath, dir } = parseArgs()

const scenesScanner = new Scanner({
  batchSize: 50,
  cacheName: 'scenes',
  dbPath,
  vamPath: dir,
})

async function task1() {
  await scenesScanner.scan(
    'Saves/scene',
    '.json',
    async (filePath: string, relativePath: string) => {
      const fileName = path.basename(filePath)
      const stats = await fsp.stat(filePath)
      const dependencies = await fromSceneFile(filePath)

      return [
        {
          name: fileName,
          path: relativePath,
          type: AssetType.Scene,
          size: stats.size,
          dependencies,
        },
      ]
    },
  )
}

async function task2() {
  await scenesScanner.scan(
    'AddonPackages',
    '.var',
    async (filePath: string, relativePath: string) => {
      const zip = new AdmZip(filePath)

      return SceneParser.fromVarFile(zip, filePath, relativePath)
    },
  )
}

try {
  await Promise.all([task1(), task2()])
} catch (e) {
  console.error(e)
} finally {
  scenesScanner.close()

  process.exit(0)
}
