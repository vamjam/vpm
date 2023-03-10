import fs from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'
import Zip from 'adm-zip'
import { Package as PackageEntity } from '@shared/entities'
import isValidString from '@shared/lib/isValidString'
import logger from '@shared/logger'
import { Package, Source } from '@shared/types'
import { ConfigService } from '~/features/config'
import { Manifest } from '~/features/vam/types'
import createId from '~/utils/createId'
import getImages from './helpers/getImages'
import guessPackageType from './helpers/guessPackageType'
import saveImages from './helpers/saveImages'

const log = logger('package.service')

const getManifest = (zip: Zip): Promise<Manifest> => {
  return new Promise((resolve, reject) => {
    zip.getEntry('meta.json')?.getDataAsync((data, err) => {
      if (err) {
        return reject(err)
      }

      const manifest = data?.toString('utf8')

      if (!isValidString(manifest)) {
        return reject(new Error('Invalid meta.json'))
      }

      try {
        const parsed = JSON.parse(manifest) as Manifest

        resolve(parsed)
      } catch (err) {
        reject(err)
      }
    })
  })
}

class PackageService {
  /**
   * Extract basic data about a package from its filename.
   * @param file URL to the .var file
   * @returns An object containing the package name, version and creator name
   */
  parseFileName(file: URL) {
    const [creatorName, name, version] = path.basename(file.href).split('.')

    if (!isValidString(creatorName)) {
      throw new Error(
        `Invalid creator name "${creatorName}" for package "${file}"`
      )
    }

    if (!isValidString(name)) {
      throw new Error(`Invalid package name "${name}" ${file}`)
    }

    return {
      creatorName,
      name,
      version: Number(version),
    }
  }

  /**
   * Creates a new Package object from a .var file
   * @param fileURL The URL of the package file
   * @returns A complete Package object
   */
  async fromVarFile(fileURL: URL) {
    const file = url.fileURLToPath(fileURL)
    const { name, version, creatorName } = this.parseFileName(fileURL)
    const zip = new Zip(file)
    const manifest = await getManifest(zip)

    if (manifest == null) {
      log.error(`Invalid package manifest for "${file}"`)

      return
    }

    const packageType = guessPackageType(manifest)

    if (packageType == null) {
      log.error(`Invalid package type for "${file}"`)

      return
    }

    const stats = await fs.stat(file)
    const imageData = getImages(zip, manifest, name)
    const images = await saveImages(
      imageData,
      zip,
      path.join(ConfigService.get<string>('path.images'), creatorName)
    )

    const source: Source = {
      id: createId(),
      url: fileURL.toString(),
      version,
      createdAt: stats.birthtime,
      updatedAt: stats.mtime,
      size: stats.size,
      credits: manifest.credits ?? null,
      description: manifest.description ?? null,
      instructions: manifest.instructions ?? null,
      licenseType: manifest.licenseType ?? null,
      dependencies: null,
      isActive: true,
    }

    const data: Package = {
      id: createId(),
      name,
      images: images.map((image) => ({
        sort: image.sort,
        url: url.pathToFileURL(image.destPath).toString(),
      })),
      creator: {
        name: creatorName,
        avatar: null,
      },
      type: packageType,
      tags: null,
      sources: [source],
    }

    return data
  }
}

export default new PackageService()
