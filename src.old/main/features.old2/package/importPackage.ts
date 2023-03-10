import { Package } from '@shared/entities'
import logger from '@shared/logger'
import Repository from '~/db/Repository'
import { ManifestParser } from '~/features/manifest'
import parseFileName from './parseFileName'

const log = logger('package.import')

export type PackageMeta = {
  creatorName: string
  name: string
  version: number
}

export class Stats {
  wasImported = false
  reason: string | null = null
  result: Package | null = null

  setResult(pkg: Package) {
    this.result = pkg

    return this
  }

  setWasImported(val: boolean) {
    this.wasImported = val

    return this
  }

  setReason(reason: string | null) {
    this.reason = reason

    return this
  }
}

export default async function importPackage(url: URL) {
  const stats = new Stats()
  const { creatorName, name, version } = parseFileName(url.toString())

  try {
    const existingPackage = await Repository.findPackageByNameAndCreator(
      name,
      creatorName,
      {
        id: true,
        versions: true,
        images: true,
      }
    )

    if (
      existingPackage != null &&
      existingPackage.versions?.includes(version)
    ) {
      return stats.setWasImported(false).setReason(`Version already exists`)
    }

    const data = await ManifestParser.parse(url)

    if (data == null) {
      throw new Error(`Unable to parse manifest "${url}"`)
    }

    if (existingPackage != null) {
      await Repository.updatePackageVersion(
        existingPackage.id,
        existingPackage.versions ?? [],
        data
      )

      return stats.setWasImported(false).setReason('Updated existing package')
    }

    log.info(`Importing package "${url}"`)

    const creator = await Repository.saveCreator(creatorName)

    if (creator == null) {
      throw new Error(`Unable to save creator "${creatorName}"`)
    }

    const images = await Repository.saveImages(data.images)
    const result = await Repository.packages().save({
      ...data,
      creator,
      creatorId: creator.id,
      images,
    })

    if (result != null) {
      return stats.setWasImported(true).setResult(result)
    }

    return stats
      .setWasImported(false)
      .setReason(`Unable to save package "${url}" to database`)
  } catch (err) {
    return stats.setWasImported(false).setReason((err as Error)?.message)
  }
}
