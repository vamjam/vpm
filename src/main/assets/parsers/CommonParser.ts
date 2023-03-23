import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { AssetFile } from '@shared/types'
import { Saveable, SaveableAsset } from '~/db/Repository'
import { pathParser } from '~/db/maps/parse'
import AssetParser from '../AssetParser'
import AssetParsers from './AssetParsers'

const findThumbnail = async (filePath: string) => {
  const imagePath = filePath.replace(path.extname(filePath), '.jpg')
  const exists = existsSync(imagePath)

  if (exists) {
    return imagePath
  }

  return undefined
}

const CommonParser: AssetParser = async ({ root, filePath, log, type }) => {
  const ext = path.extname(filePath)
  const name = path.basename(filePath, ext)

  log.startParse(name)

  const stats = await fs.stat(filePath)

  const file: Saveable<AssetFile, 'assetId'> = {
    path: pathParser.toEntity(root, filePath),
    createdAt: stats.birthtime,
    updatedAt: stats.mtime,
    size: stats.size,
    version: null,
  }

  const asset: SaveableAsset = {
    name,
    dependencies: null,
    images: null,
    creator: null,
    discussionThreadId: null,
    hubDownloadable: null,
    hubHosted: null,
    packageId: null,
    releaseDate: null,
    resourceId: null,
    tags: null,
    credits: null,
    description: null,
    instructions: null,
    licenseType: null,
    type,
    file,
  }

  const thumb = await findThumbnail(filePath)

  if (thumb != null) {
    asset.images = [
      {
        sort: 100,
        path: thumb,
      },
    ]
  }

  if (Object.hasOwn(AssetParsers, ext)) {
    const parse = AssetParsers[ext]
    const merge = await parse({ filePath, assetType: type, log })

    return merge(asset)
  }

  return asset
}

export default CommonParser
