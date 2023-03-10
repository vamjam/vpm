import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import Zip from 'adm-zip'
import sharp from 'sharp'
import slugify from '@shared/lib/slugify'
import logger from '@shared/logger'
import config from '~/features/config/config.service'

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

const imageSaveQuality = ConfigService.get('library.imageQuality') as
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

const resolveImages = (dir: string, images: InputImage[]) => {
  let counter = 1

  return images.reduce((acc, { path: zipPath, sort }) => {
    const parsed = path.parse(zipPath)
    const fileName = `${slugify(parsed.name)}${parsed.ext}`
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
  const results = []
  const resolvedImages = resolveImages(dir, images)

  for await (const image of resolvedImages) {
    const doesImageExistOnDisk = fs.existsSync(path.resolve(image.destPath))

    if (!doesImageExistOnDisk) {
      await saveToDisk(image.zipPath, image.destPath, zip)
    }

    results.push({
      destPath: image.destPath,
      sort: image.sort,
    })
  }

  return results
}
