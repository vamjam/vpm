import { Creator, Package } from '../types'
import isValidString from './isValidString'

type PackageFromKey = Pick<Package, 'name' | 'version'> & {
  creator: Pick<Creator, 'name'>
}

export const createKey = (pkg: PackageFromKey) => {
  if (!isValidString(pkg?.creator?.name)) {
    throw new Error(`Unable to create key without a creator!`)
  }

  return `${pkg.creator.name}.${pkg.name}.${pkg.version ?? 'latest'}`
}

export const fromKey = (key: string): PackageFromKey => {
  const [creator, name, version] = key.split('.')

  return {
    creator: {
      name: creator,
    },
    name,
    version: Number(version),
  }
}

export default {
  createKey,
  fromKey,
}
