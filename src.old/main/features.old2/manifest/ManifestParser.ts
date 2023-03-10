import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import Zip from 'adm-zip'
import { IMAGES_DIR } from '@shared/config'
import { Image, Package, Source } from '@shared/entities.realm'
import { ImageSources, PackageType } from '@shared/enums'
import logger from '@shared/logger'
import parseFileName from '~/features/package/parseFileName'
import getImages from './getImages'
import getManifest from './getManifest'
import guessPackageType from './guessPackageType'
import saveImages from './saveImages'

const log = logger('manifest.parser')

// const parseDependencies = async (manifest: Manifest) => {
//   const deps = Object.keys(manifest.dependencies ?? {})

//   for await (const dep of deps) {
//     const { creatorName, name } = parseFileName(dep)
//     const pkg = await Repository.findPackageByNameAndCreator(name, creatorName)

//     if (pkg != null) {
//     }
//   }
// }

export const parse = async (url: URL) => {
  const file = fileURLToPath(url)
  const { name, version, creatorName } = parseFileName(file)
  const zip = new Zip(file)
  const manifest = await getManifest(zip)

  if (manifest == null) {
    log.error(`Invalid package manifest for "${file}"`)

    return
  }

  const packageType = guessPackageType(manifest)
  const stats = await fs.stat(file)
  const images = getImages(zip, manifest, name)
  const savedImages = await saveImages(
    images,
    zip,
    path.join(IMAGES_DIR, creatorName)
  )

  const source: Source = {
    url: pathToFileURL(file).toString(),
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
    name,
    images: savedImages.map((image) => ({
      sort: image.sort,
      url: pathToFileURL(image.destPath).toString(),
    })),
    creator: {
      name: creatorName,
      avatar: null,
    },
    type: packageType,
    tags: null,
    sources:
  }

  if (packageType != null) {
    data.type = packageType
  }

  return data
}
