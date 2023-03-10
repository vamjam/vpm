import logger from '@shared/logger'
import Repository from '~/db/Repository'
import connect from '~/db/client'
import { PackageService } from '~/features/package'
import Stats from './Stats'

const log = logger('package.import')

export type PackageMeta = {
  creatorName: string
  name: string
  version: number
}

export default async function importAddon(file: URL) {
  const client = await connect()
  const { creatorName, name, version } = PackageService.parseFileName(file)

  try {
    const existingPackage = await Repository.findPackageByNameAndCreator(
      name,
      creatorName
    )

    const existingPackageVersions = existingPackage?.sources?.map(
      (source) => source.version
    )

    if (existingPackage != null && existingPackageVersions?.includes(version)) {
      return new Stats(false, `Version already exists`)
    }

    const data = await PackageService.fromVarFile(file)

    if (data == null) {
      throw new Error(`Unable to parse manifest "${file}"`)
    }

    if (existingPackage != null) {
      // await Repository.updatePackageVersion(existingPackage._id, data)

      return new Stats(false, `Updated existing package`)
    }

    log.info(`Importing package "${file}"`)

    const creator = await Repository.saveCreator(creatorName)

    if (creator == null) {
      throw new Error(`Unable to save creator "${creatorName}"`)
    }

    const result = await client.insert('Package', {
      ...data,
      creator,
    })

    if (result != null) {
      return new Stats(true, result)
    }

    return new Stats(false, `Unable to save package "${file}" to database`)
  } catch (err) {
    return new Stats(false, (err as Error)?.message)
  }
}
