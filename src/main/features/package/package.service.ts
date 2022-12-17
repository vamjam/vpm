import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import Zip from 'adm-zip'
import { Package } from '@shared/entities'
import logger from '@shared/logger'
import { IMAGES_DIR } from '~/../shared/config'
import Repository from '~/db/Repository'
import { Manifest, manifestService } from '~/features/manifest'
import IpcService from '~/lib/IpcService'
import tokenize, { VamInstallPathToken } from '~/utils/tokenize'
import walk from '~/utils/walk'
import parseFileName from './parseFileName'
import saveImages from './saveImages'

const log = logger('package/service')

export type PackageEvents = {
  'package:import': (pkg: Package) => void
}

const extractAndSaveImages = (
  zip: Zip,
  manifest: Manifest,
  name: string,
  key: string,
  creatorName: string
) => {
  const images = manifestService.getImages(zip, manifest, name)

  const imageText = images.length === 1 ? 'image' : 'images'
  log.debug(`Found ${images.length} ${imageText} for package "${key}"`)

  return saveImages(images, zip, path.join(IMAGES_DIR, creatorName))
}

const importPackage = async (file: string) => {
  const { creatorName, name, version } = parseFileName(file)
  const stats = await fs.stat(file)

  const zip = new Zip(file)
  const manifest = await manifestService.getManifest(zip)

  if (manifest == null) {
    log.error(`Invalid package manifest for "${file}"`)

    return
  }

  const key = `${creatorName}.${name}.${version}`
  const packageType = manifestService.guessPackageType(manifest)
  const savedImages = await extractAndSaveImages(
    zip,
    manifest,
    name,
    key,
    creatorName
  )

  const data: Omit<
    Package,
    | 'id'
    | 'tags'
    | 'dependants'
    | 'dependencies'
    | 'hub'
    | 'creator'
    | 'creatorId'
  > = {
    credits: manifest.credits ?? null,
    description: manifest.description ?? null,
    fileCreatedAt: stats.birthtime,
    fileUpdatedAt: stats.mtime,
    images: savedImages,
    imagesUpdatedAt: new Date(),
    instructions: manifest.instructions ?? null,
    licenseType: manifest.licenseType ?? null,
    name,
    size: stats.size,
    type: packageType ?? null,
    url: tokenize.encodePath(
      pathToFileURL(file).toString(),
      VamInstallPathToken
    ),
    version,
  }

  const pkg = await Repository.packages().save(data)

  log.debug(`Imported package "${key}"!`)

  return pkg
}

class Stats {
  wasImported = false
  reason: string | null = null

  setWasImported(val: boolean) {
    this.wasImported = val
  }

  setReason(reason: string | null) {
    this.reason = reason
  }
}

class PackageService extends IpcService<PackageEvents> {
  async importPackages(url: string) {
    const dir = fileURLToPath(url)

    log.debug(`Scanning directory "${dir}"`)

    for await (const file of walk(dir)) {
      const stats = new Stats()

      if (!file.path.endsWith('.var')) {
        log.debug(`Skipping unknown file "${file.path}"`)
        continue
      }

      const fileURL = pathToFileURL(file.path).toString()
      const wasAlreadyImported =
        (await Repository.findPackageByURL(fileURL)) != null

      if (wasAlreadyImported) {
        log.debug(`Skipping "${file.path}"`)
        continue
      }

      try {
        log.info(`Importing package "${file.path}"`)

        const result = await importPackage(file.path)

        if (result != null) {
          this.emit('package:import', result)

          stats.setWasImported(true)
        } else {
          stats.setReason(`Unable to import package "${file.path}"`)

          throw new Error(stats.reason as string)
        }
      } catch (err) {
        stats.setReason((err as Error)?.message)

        log.error('Failed to import package', err as Error)
      }

      if (!stats.wasImported) {
        log.info(`Adding "${file.path}" to failed imports`)

        const { creatorName, name, version } = parseFileName(file.path)

        await Repository.failedImportPackages().save({
          url: fileURL,
          reason: stats.reason ?? 'Unknown',
          creatorName,
          name,
          version,
        })
      }
    }

    log.debug(`Scanning "${dir}" complete!\n`)
  }
}

export default new PackageService()
