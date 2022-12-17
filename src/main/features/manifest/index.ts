import getImages from './getImages'
import getManifest from './getManifest'
import guessPackageType from './guessPackageType'

export const manifestService = {
  getImages,
  getManifest,
  guessPackageType,
}

export { default as Manifest } from './Manifest'
