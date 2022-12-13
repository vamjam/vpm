import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import Zip from 'adm-zip'
import sharp from 'sharp'
import { ImageTypes } from '@shared/enums'
import logger from '@shared/logger'
import slugify from '@shared/utils/slugify'
import { configStore } from '~/services'

const log = logger('image.saveImages')

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
        return reject(err)
      }

      const image: ImageData = {
        data,
        path: path.parse(imagePath),
      }

      resolve(image)
    })
  })
}

const exists = (dir: string): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      fs.access(dir, (err) => {
        if (err == null) {
          resolve(true)
        } else {
          resolve(false)
        }
      })
    } catch (err) {
      resolve(false)
    }
  })
}

const imageSaveQuality = configStore.get('library.imageQuality') as
  | number
  | undefined

const saveVarImages = async <T>(images: (T & ImageData)[], dir: string) => {
  const newImages: (T & { path: string })[] = []

  await fsp.mkdir(dir, { recursive: true })

  for await (const image of images) {
    const { path: imagePath } = image
    const name = `${slugify(imagePath.name)}${imagePath.ext}`

    const imageSavePath = path.resolve(dir, name)
    const doesImageExistOnDisk = await exists(imageSavePath)

    if (image.data != null) {
      const newImage = {
        ...image,
        path: imageSavePath,
      } as T & { path: string }

      if (!doesImageExistOnDisk) {
        try {
          await sharp(image.data)
            .resize(512)
            .jpeg({ quality: imageSaveQuality })
            .toFile(imageSavePath)
        } catch (err) {
          log.error(`Failed writing image to disk`, err)
        }
      }

      newImages.push(newImage)
    }
  }

  return newImages
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
  images: { sort: number; path: string }[],
  zip: Zip,
  dir: string
) {
  const results: (ImageData & {
    sort: number
  })[] = []

  for await (const image of images) {
    const data = await getImageData(image.path, zip)

    results.push({
      ...data,
      sort: image.sort,
    })
  }

  const files = await saveVarImages(results, dir)

  return files.map((file) => {
    return {
      url: pathToFileURL(file.path).toString(),
      type: ImageTypes.INTERNAL,
      sort: Math.round(file.sort),
    }
  })
}
