import fsp from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import Zip from 'adm-zip'
import sharp from 'sharp'
import { Image } from '@shared/entities'
import { ImageSources } from '@shared/enums'
import logger from '@shared/logger'
import slugify from '@shared/utils/slugify'
import Repository from '~/db/Repository'
import { configStore } from '~/features/config/config.service'
import pathExists from '~/utils/pathExists'
import tokenize, { ImagePathToken } from '~/utils/tokenize'

const log = logger('image.saveImages')

type InputImage = {
  sort: number
  path: string
}

type ImageData = {
  data: Buffer | null
  path: path.ParsedPath
}

const getImageData = async (
  imagePath: string,
  zip: Zip
): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    const zipPath = imagePath.replaceAll('\\', '/')

    zip.readFileAsync(zipPath, (data, err) => {
      if (err) {
        log.error(`Unable to read image "${imagePath}"`, new Error(err))

        return reject(err)
      }

      const imageData: ImageData = {
        data,
        path: path.parse(imagePath),
      }

      return resolve(imageData)
    })
  })
}

const imageSaveQuality = configStore.get('library.imageQuality') as
  | number
  | undefined

const saveToDisk = async (srcPath: string, destPath: string, zip: Zip) => {
  await fsp.mkdir(path.dirname(destPath), { recursive: true })
  const img = await getImageData(srcPath, zip)

  if (img.data != null) {
    await sharp(img.data)
      .resize(512)
      .jpeg({ quality: imageSaveQuality })
      .toFile(destPath)
  } else {
    log.error(`No data exists for image "${img.path}"`)
  }
}

const saveToDatabase = (data: Partial<Image>) => {
  if (data.url == null) {
    throw new Error('Invalid image data: no URL provided.')
  }

  return Repository.images().save({
    ...data,
    url: tokenize.encodePath(data.url, ImagePathToken),
  })
}

const toEntity = (
  imagePath: string,
  sort: number
): Omit<Image, 'id' | 'packages'> => {
  return {
    sort: Math.round(sort),
    source: ImageSources.MANIFEST,
    url: pathToFileURL(imagePath).toString(),
  }
}

const parseFileName = (imagePath: string) => {
  const parsed = path.parse(imagePath)
  const name = `${slugify(parsed.name)}${parsed.ext}`

  return name
}

const resolveImages = (dir: string, images: InputImage[]) => {
  let counter = 1

  return images.reduce((acc, { path: zipPath, sort }) => {
    const fileName = parseFileName(zipPath)
    const dest = path.resolve(dir, fileName)
    const found = acc.find((i) => i.destPath === dest)
    const destPath = found ? `${dest} (${counter++})` : dest

    acc.push({
      zipPath,
      destPath,
      sort,
    })

    return acc
  }, [] as { zipPath: string; destPath: string; sort: number }[])
}

/**
 * Saving images involves a few steps:
 * 1. Extract the image data from the zip
 * 2. Create an optimized version from the data
 * 3. Save to disk
 * 5. Save to database
 * 6. Return saved images
 */
export default async function saveImages(
  images: InputImage[],
  zip: Zip,
  dir: string
) {
  const results: Image[] = []
  const resolvedImages = resolveImages(dir, images)

  for await (const image of resolvedImages) {
    const entity = toEntity(image.destPath, image.sort)
    const doesImageExistOnDisk = await pathExists(image.destPath)

    if (!doesImageExistOnDisk) {
      await saveToDisk(image.zipPath, image.destPath, zip)
      const saved = await saveToDatabase(entity)

      results.push(saved)
    } else {
      // If the image exists on disk, there's a good chance
      // we'll find it in the database.
      const db = await Repository.findImageByURL(entity.url)

      if (db != null) {
        results.push(db)
      } else {
        const saved = await saveToDatabase(entity)

        results.push(saved)
      }
    }
  }

  return results
}
