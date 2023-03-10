import fs from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'
import Zip from 'adm-zip'
import { BSON } from 'realm'
import isValidString from '@shared/lib/isValidString'
import logger from '@shared/logger'
import { Package, Source } from '@shared/types'
import { ConfigService } from '~/features/config'
import { Manifest } from '~/features/vam/types'
import getImages from './getImages'
import guessPackageType from './guessPackageType'
import saveImages from './saveImages'

const log = logger('manifest.parser')

const parseFileName = (filePath: string) => {
  const [creatorName, name, version] = path.basename(filePath).split('.')

  if (!isValidString(creatorName)) {
    throw new Error(
      `Invalid creator name "${creatorName}" for package "${filePath}"`
    )
  }

  if (!isValidString(name)) {
    throw new Error(`Invalid package name "${name}" ${filePath}`)
  }

  return {
    creatorName,
    name,
    version: Number(version),
  }
}

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

export default async function fromManifest(fileURL: URL) {
  const file = url.fileURLToPath(fileURL)
  const { name, version, creatorName } = parseFileName(file)
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
    url: url.pathToFileURL(file).toString(),
    version,
    createdAt: stats.birthtime,
    updatedAt: stats.mtime,
    size: stats.size,
    credits: manifest.credits ?? null,
    description: manifest.description ?? null,
    instructions: manifest.instructions ?? null,
    licenseType: manifest.licenseType ?? null,
    dependencies: null,
  }

  const data: Package = {
    _id: new BSON.ObjectId(),
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
