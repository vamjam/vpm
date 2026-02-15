import path from 'node:path'
import { pathToFileURL } from 'node:url'
import Zip, { IZipEntry } from 'adm-zip'
import AssetType from '@shared/AssetType.ts'
import { assets, scenes } from '@shared/entities.ts'
import FileScanner from './FileScanner.ts'
import assetTypePathMap from './assetTypePathMap.ts'
import parseArgs from './parseArgs.ts'

const args = parseArgs()
const scanner = new FileScanner({
  rootPath: args.dir,
  dbPath: args.dbPath,
})

const map = Object.entries(assetTypePathMap).flatMap(([type, value]) =>
  value.paths.map((v) => ({ type, path: v, exts: value.exts })),
)

try {
  // First we scan \Saves\scene for regular json files
  await scanner.scan('Saves/scene', ['.json'], scenes, (stats, filePath) => {
    const fileName = path.basename(filePath)

    return {
      name: fileName,
      url: pathToFileURL(filePath).href,
      size: stats.size,
    }
  })

  // Then scan \AddonPackages .var (zip files) for scenes
  // included within a package
  await scanner.scan('AddonPackages', ['.var'], scenes, (stats, filePath) => {
    const zip = new Zip(filePath)

    const scenes = zip
      .getEntries()
      .filter(
        (entry) =>
          entry.entryName.startsWith('Saves/scene') &&
          entry.entryName.endsWith('.json'),
      )
    const fileName = path.basename(filePath)

    return scenes.map((scene) => ({
      name: path.basename(scene.entryName),
      url: `${AssetType.AddonPackage}://${fileName}/${scene.entryName}`,
      size: scene.header.size + stats.size,
    }))
  })

  await scanner.scan(
    'AddonPackages',
    ['.var'],
    assets,
    async (stats, filePath) => {
      const zip = new Zip(filePath)
      const files = zip.getEntries()
      const matches: { file: IZipEntry; type: AssetType }[] = []

      for (const file of files) {
        for (const { path, exts, type } of map) {
          if (
            file.entryName.startsWith(path) &&
            exts.some((e) => file.entryName.endsWith(e))
          ) {
            matches.push({ file, type: type as AssetType })
          }
        }
      }

      return matches.map((match) => {
        const fileName = path.basename(match.file.entryName)

        return {
          name: fileName,
          url: `${match.type}://${fileName}/${match.file}`,
          size: stats.size,
          type: match.type,
        }
      })
    },
  )
} catch (error) {
} finally {
  console.log(`Shutting down worker...`)

  scanner.close()

  process.exit(0)
}
