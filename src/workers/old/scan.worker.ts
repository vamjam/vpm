import path from 'node:path'
import AdmZip, { IZipEntry } from 'adm-zip'
import AssetType, { getExt, getPath } from '@shared/AssetType.ts'
import Scanner from './Scanner.ts'
import * as SceneParser from './SceneParser.ts'
import { Manifest, ManifestDependency, PendingRecord } from './types.ts'
import { parseArgs, parseFileName } from './utils.ts'

const { dbPath, dir } = parseArgs()

const addonPackagesScanner = new Scanner({
  batchSize: 50,
  cacheName: 'addonpackages',
  dbPath,
  vamPath: dir,
})

await addonPackagesScanner.scan(
  getPath(AssetType.AddonPackage),
  getExt(AssetType.AddonPackage),
  async (filePath: string, relativePath: string) => {
    const zip = new AdmZip(filePath)
    const parsedFileName = parseFileName(filePath)
    const scenes = SceneParser.fromVarFile(zip, filePath, relativePath)

    return scenes
  },
)

function parseAddonPackage(filePath: string, relativePath: string) {
  const zip = new AdmZip(filePath)
}

function parseAddonForDependencies(zip: AdmZip) {
  const metaJSON = zip.getEntry('meta.json')?.getData().toString('utf8')
  const meta = JSON.parse(metaJSON ?? '{}') as Manifest

  if (!meta.dependencies) return

  const deps = parseDependencies(meta.dependencies)
}

type Dependency = {
  creatorName: string
  packageName: string
  version: string
}

function parseDependencies(deps: Record<string, ManifestDependency>) {
  return Object.entries(deps).map(([key, meta]) => {
    return parseDependency(key, meta)
  })
}

function parseDependency(key: string, value: ManifestDependency) {
  const result: Dependency[] = [parseDependencyKey(key)]

  if (value.dependencies) {
    for (const dep of Object.keys(value.dependencies)) {
      result.push(
        ...parseDependency(
          dep,
          (value.dependencies as Record<string, ManifestDependency>)[dep],
        ),
      )
    }
  }

  return result
}

function parseDependencyKey(key: string): Dependency {
  const [creatorName, packageName, version] = key.split('.')

  return {
    creatorName,
    packageName,
    version,
  }
}
