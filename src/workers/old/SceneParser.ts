import AdmZip, { IZipEntry } from 'adm-zip'
import path from 'path'
import AssetType, { getExt, getPath } from '@shared/AssetType.ts'
import { fromVarFileEntry } from './Dependency.ts'
import { PendingRecord } from './types.ts'
import { parseFileName } from './utils.ts'

export async function fromVarFile(
  zip: AdmZip,
  filePath: string,
  relativePath: string,
) {
  const scenes = zip.getEntries().filter(isScene)
  const records: PendingRecord[] = []

  const parsedFileName = parseFileName(filePath)

  for (const scene of scenes) {
    const asset: PendingRecord = {
      name: parsedFileName?.packageName ?? path.basename(scene.entryName),
      path: path.join(relativePath, scene.entryName),
      size: scene.header.size,
      type: AssetType.Scene,
      dependencies: fromVarFileEntry(scene),
      creator: parsedFileName?.creatorName
        ? {
            name: parsedFileName.creatorName,
          }
        : undefined,
    }

    records.push(asset)
  }

  return records
}

function isScene(entry: IZipEntry) {
  return (
    entry.entryName.startsWith(getPath(AssetType.Scene)) &&
    entry.entryName.endsWith(getExt(AssetType.Scene))
  )
}
