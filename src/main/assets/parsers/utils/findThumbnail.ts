import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Zip, { IZipEntry } from 'adm-zip'
import sharp from 'sharp'
import stringSimilarity from 'string-similarity'
import { Image } from '@shared/types'
import { isNullOrEmpty } from '@shared/utils/String'
import config from '~/config'
import logger from '~/logger'
import fromZip from './fromZip'

const log = logger('addon.thumbnail')

const IMAGE_EXTS = ['.png', '.jpg', '.jpeg']

const IMAGES_ROOT = new URL(config.get('images.url'))
const IMAGES_SAVE_QUALITY = config.get('images.quality')

const saveImageFromZip = async (
  zip: Zip,
  imagePath: string,
  creatorName: string
) => {
  const buffer = await fromZip(zip, imagePath)
  const fileName = path.basename(imagePath)
  const dest = path.join(fileURLToPath(IMAGES_ROOT), creatorName, fileName)

  await fs.mkdir(path.dirname(dest), { recursive: true })

  if (existsSync(dest)) {
    return undefined
  }

  try {
    await sharp(buffer)
      .resize(512)
      .jpeg({ quality: IMAGES_SAVE_QUALITY })
      .toFile(dest)

    return dest
  } catch (err) {
    log.error(`Failed to save image "${fileName}"`, err as Error)

    return undefined
  }
}

const imageFilter = (entry: IZipEntry) => {
  if (entry.isDirectory || entry.entryName.includes('Texture')) {
    return false
  }

  return IMAGE_EXTS.includes(path.extname(entry.entryName))
}

const imageMapParser = (packageName: string) => (entry: IZipEntry) => {
  const { entryName } = entry
  const imageName = path.basename(entryName, path.extname(entryName))
  const score = stringSimilarity.compareTwoStrings(packageName, imageName)

  return {
    sort: Math.floor(score * 100),
    path: entryName,
  }
}

export default async function findThumbnail(
  packageName: string,
  creatorName: string,
  zip: Zip
) {
  const imageMapper = imageMapParser(packageName)
  const images = zip
    .getEntries()
    .filter(imageFilter)
    .map(imageMapper)
    .sort((a, b) => b.sort - a.sort)

  if (images.length === 0) {
    return undefined
  }

  const dest = await saveImageFromZip(zip, images[0].path, creatorName)

  if (isNullOrEmpty(dest)) {
    return undefined
  }

  return {
    sort: images[0].sort,
    path: dest,
  } as Image
}
