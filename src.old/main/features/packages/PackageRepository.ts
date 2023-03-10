import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { Knex } from 'knex'
import * as entity from '@shared/entities'
import logger from '@shared/logger'
import { Dependency, Image, Package, Source } from '@shared/types'
import hashid from '@shared/utils/hashid'
import client from '~/db/client'
import config from '~/features/config'

const log = logger('package.repository')

export type PartialDependency = Pick<Dependency, 'version' | 'name'> & {
  creatorName: string
}

export type PartialSource = Omit<Source, 'id' | 'dependencies'> & {
  id?: string
  dependencies?: PartialDependency[]
}

export type ImageBuffer = Omit<Image, 'url' | 'id'> & {
  data: Buffer | null
}

export type PartialPackage = Omit<Package, 'sources' | 'id' | 'images'> & {
  id?: string
  sources: PartialSource[]
  images: ImageBuffer[]
}

const PackageRepository = {
  /**
   * Saves a package and its relationships to the
   * database. This currently includes:
   * - The package itself
   * - Sources (and Dependencies)
   * - Images
   *
   * If no data is supplied for nested objects, that save
   * will NOT be performed.
   * @param data {PartialPackage}: The data object
   */
  async savePackage(data: PartialPackage) {
    try {
      await client.transaction(async (trx) => {
        const [creatorId] = await trx<entity.Creator>('creators').upsert({
          ...data.creator,
          id: hashid.decode(data.creator.id),
        })

        const [pkgId] = await trx<entity.Package>('packages').insert({
          creatorId,
          name: data.name,
          tags: data.tags?.join(','),
          type: data.type,
        })

        const imgIds = await trx<entity.Image>('images').upsert(
          data.images.map((image) => ({
            sort: image.sort,
            url: image.url,
          }))
        )

        const packageImages: entity.PackageImage[] = imgIds.map((img) => ({
          imageId: img,
          packageId: pkgId,
        }))

        if (packageImages.length) {
          await trx<entity.PackageImage>('package_images').insert(packageImages)
        }

        if (data.sources != null && data.sources.length) {
          for await (const source of data.sources) {
            await this.saveSource(trx, pkgId, source)
          }
        }
      })

      log.info(`Saved package "${data.name}"`)
    } catch (err) {
      log.error(`Failed to save package: ${data.name}`, err as Error)
    }
  },

  async saveImages(
    trx: Knex.Transaction,
    packageId: number,
    images: ImageBuffer[]
  ) {
    const saveQuality = config.get<number>('library.imageQuality')

    for await (const image of images) {
      if (image.data == null) {
        continue
      }

      const imageURL = new URL(image.url)
      const imagePath = fileURLToPath(imageURL)

      if (existsSync(imagePath)) {
        log.debug(`Image exists, skipping`)

        continue
      }

      await saveToDisk(imagePath)
    }
  },

  async saveSource(
    trx: Knex.Transaction,
    packageId: number,
    data: PartialSource
  ) {
    const source: Omit<entity.Source, 'id'> = {
      createdAt: data.createdAt.getTime(),
      credits: data.credits,
      description: data.description,
      instructions: data.instructions,
      isActive: data.isActive ? 1 : 0,
      licenseType: data.licenseType,
      packageId,
      size: data.size,
      updatedAt: data.updatedAt?.getTime() ?? null,
      url: data.url,
      version: data.version,
    }

    const [sourceId] = await trx<entity.Source>('sources').insert(source)

    if (data.dependencies != null) {
      for await (const dep of data.dependencies) {
        const [creatorId] = await trx<entity.Creator>('creators').upsert({
          name: dep.creatorName,
        })

        await trx<entity.Dependency>('dependencies').insert({
          name: dep.name,
          sourceId,
          creatorId,
          version: dep.version.toString(),
        })
      }
    }

    return sourceId
  },
}

export default PackageRepository
