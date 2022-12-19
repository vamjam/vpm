import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import Zip from 'adm-zip'
import { Creator, Image, Package } from '@shared/entities'
import logger from '@shared/logger'
import { IMAGES_DIR } from '~/../shared/config'
import Repository from '~/db/Repository'
import { Manifest, manifestService } from '~/features/manifest'
import IpcService from '~/lib/IpcService'
import tokenize, { VamInstallPathToken } from '~/utils/tokenize'
import walk from '~/utils/walk'
import parseFileName from './parseFileName'
import saveImages from './saveImages'

const log = logger('package.service')

export type PackageEvents = {
  'package:import': (pkg: Package) => void
}

const extractAndSaveImages = (
  zip: Zip,
  manifest: Manifest,
  name: string,
  creatorName: string
) => {
  const images = manifestService.getImages(zip, manifest, name)

  const imageText = images.length === 1 ? 'image' : 'images'
  log.debug(
    `Found ${images.length} ${imageText} for package "${creatorName}.${name}"`
  )

  return saveImages(images, zip, path.join(IMAGES_DIR, creatorName))
}

/**
 * Using a given zipped file (.var), extract all package
 * data from it, save images to disk, etc. Anything that
 * needs any data from the zip, has to be done inside here!
 * @param file Path to the .var file
 * @param name Name of the package (according to the file name)
 * @param version
 * @param creator The already parsed creator object
 * @param withImages Should images be processed as well?
 * Again, this has to be decided, and done, inside this function!
 * @returns A data object suitable for saving to the database
 */
const extractData = async (
  file: string,
  name: string,
  version: number,
  creator: Creator,
  withImages = true
) => {
  const stats = await fs.stat(file)
  const zip = new Zip(file)
  const manifest = await manifestService.getManifest(zip)

  if (manifest == null) {
    log.error(`Invalid package manifest for "${file}"`)

    return
  }

  const packageType = manifestService.guessPackageType(manifest)
  const data: Omit<
    Package,
    | 'id'
    | 'tags'
    | 'dependants'
    | 'dependencies'
    | 'hub'
    | 'images'
    | 'imagesUpdatedAt'
  > & {
    images?: Image[]
    imagesUpdatedAt?: Date
    version: number
  } = {
    credits: manifest.credits ?? null,
    description: manifest.description ?? null,
    fileCreatedAt: stats.birthtime,
    fileUpdatedAt: stats.mtime,
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
    versions: [version],
    creator,
    creatorId: creator.id,
    hubPackageId: null,
    hubResourceId: null,
  }

  if (withImages) {
    const savedImages = await extractAndSaveImages(
      zip,
      manifest,
      name,
      creator.name
    )

    data.images = savedImages
    data.imagesUpdatedAt = new Date()
  }

  return data
}

const savePackageToDB = async (
  file: string,
  name: string,
  version: number,
  creator: Creator
) => {
  const data = await extractData(file, name, version, creator)

  if (data != null) {
    const pkg = await Repository.packages().save(data)

    log.debug(`Imported package "${creator.name}.${name}"!`)

    return pkg
  }

  return undefined
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

const parseCreator = async (creatorName: string) => {
  const creator = await Repository.creators().findOne({
    where: {
      name: creatorName,
    },
  })

  if (creator == null) {
    log.debug(`Creating new creator "${creatorName}"`)

    return Repository.creators().save({
      name: creatorName,
    })
  }

  return creator
}

const handleMultipleVersions = async (
  existingPackage: Package,
  newPackage: Partial<Package> & { version: number }
) => {
  if (existingPackage.versions?.includes(newPackage.version)) {
    return
  }

  const versions = (existingPackage.versions ?? []).concat(newPackage.version)

  const merged: Partial<Package> = {
    ...newPackage,
    versions,
  }

  delete merged.version
  delete merged.id

  const highestExistingVersion = Math.max(...(existingPackage.versions ?? [0]))

  if (newPackage.version > highestExistingVersion) {
    Object.assign(merged, {
      url: newPackage.url,
      size: newPackage.size,
      fileCreatedAt: newPackage.fileCreatedAt,
      fileUpdatedAt: newPackage.fileUpdatedAt,
      description: newPackage.description,
      instructions: newPackage.instructions,
      licenseType: newPackage.licenseType,
    })
  }

  await Repository.packages().update(
    {
      id: existingPackage.id,
    },
    merged
  )
}

class PackageService extends IpcService<PackageEvents> {
  async importPackages(url: string) {
    const dir = fileURLToPath(url)

    log.debug(`Scanning directory "${dir}"`)

    for await (const file of walk(dir)) {
      if (!file.path.endsWith('.var')) {
        log.debug(`Skipping unknown file "${file.path}"`)
        continue
      }

      const { creatorName, name, version } = parseFileName(file.path)
      const fileURL = pathToFileURL(file.path).toString()

      const stats = new Stats()

      try {
        const existingPackage = await Repository.findPackageByNameAndCreator(
          name,
          creatorName
        )

        const creator = await parseCreator(creatorName)

        if (existingPackage != null) {
          if (existingPackage.versions?.includes(version)) {
            log.debug(`Skipping "${file.path}": Version already exists`)
            continue
          }

          const newPackage = await extractData(
            file.path,
            name,
            version,
            creator,
            false
          )

          if (newPackage != null) {
            await handleMultipleVersions(existingPackage, newPackage)
          }

          continue
        }

        log.info(`Importing package "${file.path}"`)

        const result = await savePackageToDB(file.path, name, version, creator)

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
