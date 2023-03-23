import { PageParams } from '@shared/api'
import {
  Asset,
  AssetEntity,
  AssetFile,
  AssetFileEntity,
  AssetType,
  Creator,
  CreatorEntity,
  Image,
  ImageEntity,
} from '@shared/types'
import { isNullOrEmpty } from '@shared/utils/String'
import client from '~/db/client'
import * as AssetMap from './maps/AssetMap'
import { boolParser, dateParser, pathParser } from './maps/parse'

export type Saveable<T, K extends string = ''> = Omit<T, 'id' | K>
export type SaveableImage = Saveable<Image>
export type SaveableCreator = Saveable<Creator>

export type SaveableAsset = Saveable<
  Omit<Asset, 'creator' | 'images' | 'dependencies' | 'files' | 'type'> & {
    creator: SaveableCreator | null
    images: SaveableImage[] | null
    dependencies: SaveableAsset[] | null
    file: Saveable<AssetFile, 'assetId'>
    type: AssetType | null
  }
>

type EntityQuery<T extends object, P extends string> = {
  [K in keyof T as `${P}.${K & string}`]: T[K]
}

export type FileEntityQuery = EntityQuery<AssetFileEntity, 'file'>

export type CreatorEntityQuery = EntityQuery<CreatorEntity, 'creator'>

export type ImageEntityQuery = EntityQuery<ImageEntity, 'image'>

export type AssetEntityQuery = AssetEntity &
  CreatorEntityQuery &
  ImageEntityQuery &
  FileEntityQuery

export type EntityQueryGroup<T> = {
  [id: string]: T[]
}

const groupEntities = <T extends { id: number }>(entities: T[]) => {
  return entities.reduce((result, entity) => {
    if (!result[entity.id]) {
      result[entity.id] = [entity]
    } else {
      result[entity.id].push(entity)
    }

    return result
  }, {} as EntityQueryGroup<T>)
}

const assetFilesSelector = [
  `asset_files.id as 'file.id'`,
  `asset_files.path as 'file.path'`,
  `asset_files.createdAt as 'file.createdAt'`,
  `asset_files.updatedAt as 'file.updatedAt'`,
  `asset_files.size as 'file.size'`,
  `asset_files.version as 'file.version'`,
]

const Repository = {
  async findCreatorByName(name: string | null) {
    if (isNullOrEmpty(name)) {
      return null
    }

    return client.creators().whereLike('name', `${name}%`).first()
  },

  async upsertCreator(data: SaveableCreator) {
    const exists = await this.findCreatorByName(data.name)

    if (exists?.id != null) {
      return exists.id
    }

    const entity: Saveable<CreatorEntity> = {
      name: data.name,
      avatar: data.avatar ?? null,
      userId: data.userId ?? null,
    }

    const [creator] = await client.creators().insert(entity, ['id'])

    return creator.id
  },

  async getAssets({
    page = 0,
    limit = 20,
    orderBy = 'file.createdAt',
    orderDir = 'desc',
  }: PageParams) {
    const results = (await client
      .assetFiles()
      .orderBy(orderBy, orderDir)
      .offset(page * limit)
      .limit(limit)
      .join('assets', {
        'asset_files.assetId': 'assets.id',
      })
      .join('creators', {
        'assets.creatorId': 'creators.id',
      })
      .join('images', {
        'assets.id': 'images.assetId',
      })
      .select(
        'assets.*',
        ...assetFilesSelector,
        `images.url as 'image.url'`,
        `images.sort as 'image.sort'`,
        `images.id as 'image.id'`,
        `creators.name as 'creator.name'`,
        `creators.avatar as 'creator.avatar'`,
        `creators.userId as 'creator.userId'`
      )) as AssetEntityQuery[]

    return Object.values(groupEntities(results)).map((entities) => {
      return AssetMap.fromEntity(entities)
    })
  },

  async findAssetByPath(filePath: string) {
    const result = await client
      .assetFiles()
      .where({ path: filePath })
      .returning('assetId')
      .first()

    return result?.assetId
  },

  async findAssetByNameAndCreator(packageName: string, creatorName: string) {
    const creator = await client
      .creators()
      .where({ name: creatorName })
      .returning('id')
      .first()

    if (creator?.id) {
      const result = await client
        .assets()
        .where({
          name: packageName,
          creatorId: creator.id,
        })
        .returning('id')
        .first()

      return result?.id
    }

    return undefined
  },

  async getAssetById(id: number) {
    const result = (await client
      .assets()
      .where({ id })
      .join('asset_files', {
        'asset_files.assetId': 'assets.id',
      })
      .select('assets.*', ...assetFilesSelector)) as AssetEntityQuery[]

    return AssetMap.fromEntity(result)
  },

  async saveAssetFile(
    root: URL,
    assetId: number,
    data: Saveable<AssetFile, 'assetId'>
  ) {
    const [result] = await client.assetFiles().insert(
      {
        assetId,
        createdAt: dateParser.toEntity(data.createdAt),
        path: pathParser.toEntity(root, data.path),
        size: data.size,
        updatedAt: dateParser.toEntity(data.updatedAt),
        version: data.version,
      },
      'id'
    )

    return result?.id
  },

  async saveAsset(root: URL, data: SaveableAsset) {
    // if (data.file && !isNullOrEmpty(data.file?.path)) {
    //   const exists = await this.findAssetByPath(data.file.path)

    //   if (exists) {
    //     log.info(`Asset "${data.name}" already exists.`)

    //     return undefined
    //   }

    //   if (data.file.version != null && data.creator?.name) {
    //     const match = await this.findAssetByNameAndCreator(
    //       data.name,
    //       data.creator?.name
    //     )

    //     if (match != null) {
    //       const versions = (
    //         await client
    //           .assetFiles()
    //           .where({
    //             assetId: match,
    //           })
    //           .returning('version')
    //       ).map((asset) => asset.version)

    //       if (versions.includes(data.file.version)) {
    //         log.info(`Asset "${data.name}" already exists.`)

    //         return undefined
    //       }

    //       log.info(
    //         `Found new version of existing package "${data.name}" version ${data.file.version}`
    //       )

    //       // Save the new version only
    //       return this.saveAssetFile(match, data.file)
    //     }
    //   }
    // }

    const creatorId =
      data.creator != null ? await Repository.upsertCreator(data.creator) : null

    const asset: Omit<AssetEntity, 'id'> = {
      name: data.name,
      type: data.type ?? null,
      creatorId,
      discussionThreadId: data.discussionThreadId,
      hubDownloadable: boolParser.toEntity(data.hubDownloadable),
      hubHosted: boolParser.toEntity(data.hubHosted),
      packageId: data.packageId,
      releaseDate: dateParser.toEntity(data.releaseDate),
      resourceId: data.resourceId,
      tags: data.tags?.join(',') ?? null,
      credits: data.credits,
      description: data.description,
      instructions: data.instructions,
      licenseType: data.licenseType,
    }

    const [savedAsset] = await client.assets().insert(asset, 'id')

    if (data.file) {
      await this.saveAssetFile(root, savedAsset.id, data.file)
    }

    if (data.images && data.images?.length > 0) {
      await this.saveImages(savedAsset.id, data.images)
    }

    return savedAsset.id
  },

  async saveImages(assetId: number, images: SaveableImage[]) {
    const entities = images.map((image) => ({
      assetId,
      sort: image.sort,
      path: image.path,
    }))

    const result = await client.images().insert(entities, ['id'])

    return result.map((r) => r.id)
  },
}

export default Repository
