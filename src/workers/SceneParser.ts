import AdmZip, { IZipEntry } from 'adm-zip'
import path from 'path'
import AssetType from '@shared/AssetType.ts'
import { PendingRecord } from './types.ts'
import { parseFileName } from './utils.ts'

export async function fromAddonPackage(
  zip: AdmZip,
  filePath: string,
  relativePath: string,
) {
  const scenes = zip.getEntries().filter(isScene)
  const sceneAssets: PendingRecord[] = []

  const parsedFileName = parseFileName(filePath)

  for (const scene of scenes) {
    const asset: PendingRecord = {
      name: parsedFileName?.packageName ?? path.basename(scene.entryName),
      path: path.join(relativePath, scene.entryName),
      size: scene.header.size,
      type: AssetType.Scene,
      dependencies: findDependencies(scene),
      creator: parsedFileName?.creatorName
        ? {
            name: parsedFileName.creatorName,
          }
        : undefined,
    }

    sceneAssets.push(asset)
  }

  return sceneAssets
}

const depFinder = /[^"]+:\/+.+\.(\w+)/g

export function findDependencies(jsonEntry: IZipEntry) {
  const jsonFile = jsonEntry.getData().toString('utf8')

  return [...jsonFile.matchAll(depFinder)].map((e) => e[0])
}

function isScene(entry: IZipEntry) {
  return (
    entry.entryName.startsWith('Saves/scene') &&
    entry.entryName.endsWith('.json')
  )
}
