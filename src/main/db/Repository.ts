import { Asset, Creator, Dependency, Image } from '@shared/types'
import { isNullOrEmpty } from '@shared/utils/String'
import client from '~/db/client'
import logger from '~/logger'

const log = logger('db.Repository')

export type Saveable<T> = Omit<T, 'id'>
export type SaveableImage = Saveable<Image>
export type SaveableCreator = Saveable<Creator>
export type SaveableDependency = Saveable<Dependency>

export type SaveableAsset = Saveable<
  Omit<Asset, 'creator' | 'images' | 'dependencies'> & {
    creator: SaveableCreator | null
    images: SaveableImage[] | null
    dependencies: SaveableDependency[] | null
  }
>

const Repository = {
  async findCreatorByName(name: string) {
    return client.creators().where({ name })
  },

  async upsertCreator(name: string) {
    const exists = await client
      .creators()
      .whereLike('name', `${name}%`, ['id'])
      .first()

    if (exists?.id != null) {
      return exists.id
    }

    const [creator] = await client.creators().insert({ name }, ['id'])

    return creator.id
  },

  async findAssetByURL(url: URL) {
    return client.assets().where({ url: url.toString() }).first()
  },

  async saveAsset(asset: SaveableAsset) {
    const exists = await this.findAssetByURL(new URL(asset.url))

    if (exists) {
      log.info(`Asset "${asset.name}" already exists.`)

      return
    }

    const creatorId =
      asset.creator != null && !isNullOrEmpty(asset.creator?.name)
        ? await Repository.upsertCreator(asset.creator.name)
        : null

    const [savedAsset] = await client.assets().insert(
      {
        name: asset.name,
        url: asset.url,
        type: asset.type,
        version: asset.version,
        createdAt: asset.createdAt?.getTime(),
        size: asset.size,
        creatorId,
      },
      ['id']
    )

    if (asset.images != null && asset.images?.length > 0) {
      await Repository.saveImages(savedAsset.id, asset.images)
    }

    return client.assets().where({ id: savedAsset.id }).first()
  },

  async saveImages(assetId: number, images: SaveableImage[]) {
    const entities = images.map((image) => ({
      assetId,
      sort: image.sort,
      url: image.url,
    }))

    const result = await client.images().insert(entities, ['id'])

    return result.map((r) => r.id)
  },
}

export default Repository
