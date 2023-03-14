import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'
import chalk from 'chalk'
import pms from 'pretty-ms'
import { AssetEntity, AssetType } from '@shared/types'
import { isNullOrEmpty } from '@shared/utils/String'
import config from '~/config'
import Repository, { SaveableAsset } from '~/db/Repository'
import logger from '~/logger'
import fromRoot from '~/utils/fromRoot'
import streamdir, { StreamEntryInfo } from '~/utils/streamdir'
import AssetParser from './AssetParser'
import AssetTypeMap, { AssetInfo } from './AssetTypeMap'

const log = logger('asset.scanner')

const findThumbnail = async (filePath: string) => {
  const imagePath = filePath.replace(path.extname(filePath), '.jpg')

  if (existsSync(imagePath)) {
    return url.pathToFileURL(imagePath) as URL
  }

  return undefined
}

const parseAsset = async (filePath: string, type: AssetType) => {
  const fileURL = url.pathToFileURL(filePath)
  const entity = await Repository.findAssetByURL(fileURL)

  // Skip assets that are already in the database
  if (entity) {
    return undefined
  }

  const ext = path.extname(filePath)
  const name = path.basename(filePath, ext)

  log.info(`${formatAssetLabel(AssetType[type])}: Parsing "${name}"`)

  const stats = await fs.stat(filePath)

  const asset: SaveableAsset = {
    url: fileURL.toString(),
    createdAt: stats.birthtime,
    size: stats.size,
    type,
    name,
    version: null,
    dependencies: null,
    images: null,
    creator: null,
  }

  const thumb = await findThumbnail(filePath)

  if (thumb != null) {
    asset.images = [
      {
        sort: 100,
        url: thumb.toString(),
      },
    ]
  }

  if (Object.hasOwn(AssetParser, ext)) {
    const parse = AssetParser[ext]
    const merge = await parse(filePath)

    return merge(asset)
  }

  return asset
}

const parseAssetType = async (root: URL, type: AssetType, info: AssetInfo) => {
  const assets: AssetEntity[] = []
  const dir = fromRoot(root, info.path)

  const fileFilter = (entry: StreamEntryInfo) =>
    path.extname(entry.path).toLowerCase() === info.ext

  const assetFiles = streamdir(dir, {
    fileFilter,
  })

  for await (const file of assetFiles) {
    const asset = await parseAsset(file.fullPath, type)

    if (asset != null) {
      const saved = await Repository.saveAsset(asset)

      if (saved != null) {
        assets.push(saved)
      }
    }
  }

  return assets
}

const formatAssetLabel = (assetType: string) => {
  return `${chalk.magenta(`[${assetType}]`)}`
}

const AssetScanner = {
  async scan() {
    const start = Date.now()
    const rootAsString = config.get('vam.url')

    if (isNullOrEmpty(rootAsString)) {
      throw new Error('vam.url is not set')
    }

    const root = new URL(rootAsString)

    log.info(`Asset scan started at ${root}`)

    for await (const [assetType, assetInfo] of Object.entries(AssetTypeMap)) {
      const assetStart = Date.now()
      const assetTypeNumber = Number(assetType) as AssetType
      const assetTypeName = AssetType[assetTypeNumber]

      log.info(
        `${formatAssetLabel(assetTypeName)}: Starting scan at ${fromRoot(
          root,
          assetInfo.path
        )}`
      )

      const assets = await parseAssetType(root, assetTypeNumber, assetInfo)
      const assetEnd = Date.now()

      log.info(
        `${formatAssetLabel(assetTypeName)}: ${
          assets.length
        } new asset(s) added in ${pms(assetEnd - assetStart)}`
      )
    }

    const end = Date.now()
    const dur = pms(end - start)

    log.info(`Asset scan completed in ${dur}`)
  },
}

export default AssetScanner
