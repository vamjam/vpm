import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import Zip from 'adm-zip'
import sharp from 'sharp'
import slugify from '@shared/lib/slugify'
import logger from '@shared/logger'
import config from '~/features/config'

const log = logger('package.saveImages')

export default function saveImages() {}

// type InputImage = {
//   sort: number
//   path: string
// }

type ImageData = {
  data: Buffer | null
  path: path.ParsedPath
}

const getImageData2 = async (
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

export const getImageData = async (
  imagePathInZip: string,
  zip: Zip
): Promise<ImageData | undefined> => {
  return new Promise((resolve, reject) => {
    const resolvedPath = imagePathInZip.replaceAll('\\', '/')

    zip.readFileAsync(resolvedPath, (data, err) => {
      if (err) {
        log.error(`Unable to read image "${imagePathInZip}"`, new Error(err))

        return reject(err)
      }

      const imageData: ImageData = {
        data,
        path: path.parse(imagePathInZip),
      }

      return resolve(imageData)
    })
  })
}

// const imageSaveQuality = config.get<number>('library.imageQuality')

export const saveToDisk = async (
  destPath: string,
  imageData: Buffer | null,
  imageSaveQuality: number
) => {
  await fsp.mkdir(path.dirname(destPath), { recursive: true })

  if (imageData != null) {
    await sharp(imageData)
      .resize(512)
      .jpeg({ quality: imageSaveQuality })
      .toFile(destPath)
  } else {
    log.error(`No data exists for image "${destPath}"`)
  }
}

// const resolveImages = (dir: string, images: InputImage[]) => {
//   let counter = 1

//   return images.reduce((acc, { path: zipPath, sort }) => {
//     const parsed = path.parse(zipPath)
//     const fileName = `${slugify(parsed.name)}${parsed.ext}`
//     const dest = path.resolve(dir, fileName)
//     const found = acc.find((i) => i.destPath === dest)
//     const destPath = found ? `${dest} (${counter++})` : dest

//     acc.push({
//       zipPath,
//       destPath,
//       sort,
//     })

//     return acc
//   }, [] as { zipPath: string; destPath: string; sort: number }[])
// }

// export default async function saveImages(
//   images: InputImage[],
//   zip: Zip,
//   dir: string
// ) {
//   const results = []
//   const resolvedImages = resolveImages(dir, images)

//   for await (const image of resolvedImages) {
//     const doesImageExistOnDisk = fs.existsSync(path.resolve(image.destPath))

//     if (!doesImageExistOnDisk) {
//       await saveToDisk(image.zipPath, image.destPath, zip)
//     }

//     results.push({
//       destPath: image.destPath,
//       sort: image.sort,
//     })
//   }

//   return results
// }
