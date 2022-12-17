import { FindOneOptions } from 'typeorm'
import { Creator, FailedImportPackage, Image, Package } from '@shared/entities'
import { client } from '~/db/connect'
import tokenize, { ImagePathToken, VamInstallPathToken } from '~/utils/tokenize'

const Repository = {
  packages: () => client.getRepository(Package),
  failedImportPackages: () => client.getRepository(FailedImportPackage),
  creators: () => client.getRepository(Creator),
  images: () => client.getRepository(Image),
  /**
   *
   * @param url
   * @returns
   */
  findImageByURL: async (url: string) => {
    const query: FindOneOptions = {
      where: {
        url: tokenize.encodePath(url, ImagePathToken),
      },
      select: ['id'],
    }

    return client.getRepository(Image).findOne(query)
  },
  /**
   * Finds a package by URL from multiple tables
   * (Package and FailedImportPackage).
   * @param url The file:// URL to search for
   * @returns The package, if found, or null
   */
  findPackageByURL: async (url: string) => {
    const query: FindOneOptions = {
      where: {
        url: tokenize.encodePath(url, VamInstallPathToken),
      },
      select: ['id'],
    }

    const pkgResult = await client.getRepository(Package).findOne(query)

    if (pkgResult != null) {
      return pkgResult
    }

    const failedImport = await client
      .getRepository(FailedImportPackage)
      .findOne(query)

    return failedImport
  },
}

export default Repository
