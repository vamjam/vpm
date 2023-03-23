import fs from 'node:fs/promises'
import path from 'node:path'
import Zip from 'adm-zip'
import { AssetFile } from '@shared/types'
import { isNullOrEmpty } from '@shared/utils/String'
import Repository, { Saveable, SaveableAsset } from '~/db/Repository'
import { pathParser, stringParser } from '~/db/maps/parse'
import { Logger } from '~/logger'
import Manifest from '~/vam/Manifest'
import AssetParser from '../AssetParser'
import findThumbnail from './utils/findThumbnail'
import fromZip from './utils/fromZip'
import guessPackageType from './utils/guessPackageType'

const parseFileName = (file: string) => {
  const [creator, name, stringVersion] = path.basename(file, '.var').split('.')
  const version = Number(stringVersion)

  return {
    creator,
    name,
    version: Number.isNaN(version) ? null : version,
  }
}

export class TestParser {
  constructor(public root: URL, public filePath: string, public log: Logger) {}

  async parseName() {
    const zip = new Zip(this.filePath)
    const buf = await fromZip(zip, 'meta.json')
    const manifest = JSON.parse(buf.toString('utf8')) as Manifest
    const { creator, name, version } = parseFileName(this.filePath)
    const packageName = manifest.packageName ?? name

    return packageName
  }

  parseFile() {}

  parse() {}
}

const AddonParser: AssetParser = async ({ root, filePath, log }) => {
  const zip = new Zip(filePath)
  const buf = await fromZip(zip, 'meta.json')
  const manifest = JSON.parse(buf.toString('utf8')) as Manifest
  const { creator, name, version } = parseFileName(filePath)
  const packageName = manifest.packageName ?? name
  const creatorName = manifest.creatorName ?? creator

  if (isNullOrEmpty(packageName)) {
    throw new Error('Invalid package name')
  }

  if (isNullOrEmpty(creatorName)) {
    throw new Error('Invalid creator name')
  }

  log.startParse(packageName)

  const stats = await fs.stat(filePath)

  const file: Saveable<AssetFile, 'assetId'> = {
    path: pathParser.toEntity(root, filePath),
    createdAt: stats.birthtime,
    updatedAt: stats.mtime,
    size: stats.size,
    version,
  }

  const existingAssetID = await Repository.findAssetByNameAndCreator(
    packageName,
    creatorName
  )

  if (existingAssetID) {
    const entity = await Repository.getAssetById(existingAssetID)
    const hasVersion = entity.files?.some((f) => f.version === version) ?? false

    if (!hasVersion) {
      await Repository.saveAssetFile(root, existingAssetID, file)

      log.info(`Saving new asset version...`)
    }

    return undefined
  }

  const type = guessPackageType(zip) ?? null
  const asset: SaveableAsset = {
    name: packageName,
    creator: {
      name: creatorName,
      avatar: null,
      userId: null,
    },
    type,
    credits: stringParser.toEntity(manifest.credits),
    description: stringParser.toEntity(manifest.description),
    instructions: stringParser.toEntity(manifest.instructions),
    licenseType: stringParser.toEntity(manifest.licenseType),
    images: null,
    dependencies: null,
    discussionThreadId: null,
    hubDownloadable: null,
    hubHosted: null,
    packageId: null,
    releaseDate: null,
    resourceId: null,
    tags: null,
    file,
  }

  const thumbnail = await findThumbnail(packageName, creatorName, zip)

  if (thumbnail != null) {
    asset.images = [thumbnail]
  }

  return asset
}

export default AddonParser
