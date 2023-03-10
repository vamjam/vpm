import { Creator, Package } from '@shared/entities'
import isValidString from '@shared/lib/isValidString'
import client from '~/db/client'

const setPackageActive = async (
  packageId: string,
  sourceId: string,
  isActive: boolean
) => {
  if (isActive) {
    await client('active_packages').insert([{ packageId, sourceId }])
  } else {
    await client('active_packages').where({ packageId, sourceId }).del()
  }
}

const Repository = {
  findPackageByName(name: string) {
    return client<Package>('packages').where({ name }).first()
  },

  async activatePackage(id: string, sourceId: string) {
    await setPackageActive(id, sourceId, true)
  },

  async deactivatePackage(id: string, sourceId: string) {
    await setPackageActive(id, sourceId, false)
  },

  async saveCreator(name?: string) {
    if (!isValidString(name)) {
      throw new Error('Invalid creator name')
    }

    const existing = await client<Creator>('creators').where({ name }).first()

    if (existing) {
      return existing
    }

    const created = await client<Creator>('creators')
      .insert({ name }, ['id', 'name', 'avatar'])
      .first()

    return created
  },
  /**
   * Finds a package with the given name and creator's name.
   * The result of this query can be used to determine if we
   * have another version of the same package. If we do, we
   * can simply save the new version on the existing package
   * in the database.
   * @param name Name of the package
   * @param creatorName Creator's name of the package
   */
  findPackageByNameAndCreator: async (name: string, creatorName: string) => {
    const pkg = await client<Package>('packages').where({ name }).first()

    if (!pkg) {
      return undefined
    }

    const hasCreator = await client<Creator>('creators')
      .where({
        id: pkg.creatorId,
        name: creatorName,
      })
      .first()

    if (!hasCreator) {
      return undefined
    }

    return pkg
  },
}

export default Repository
