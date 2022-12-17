import path from 'node:path'
import Zip from 'adm-zip'
import stringSimilarity from 'string-similarity'
import Manifest from '~/features/manifest/Manifest'
import ExtensionMap from '~/features/manifest/maps/ExtensionMap'

const imageFileExtensions = ['.jpg', '.png']
const pkgFileExtensions = Object.values(ExtensionMap).flat()

const isImage = (imagePath: string) => {
  if (imagePath.includes('Texture')) {
    return false
  }

  return imageFileExtensions.includes(path.extname(imagePath))
}

const isContent = (contentPath: string) => {
  return pkgFileExtensions.includes(path.extname(contentPath))
}

const mapToImage = (imagePath: string, sort: number) => ({
  path: imagePath,
  sort,
})

const getImagesFromZip = (zip: Zip, fileName: string) => {
  const entries = zip.getEntries().map((entry) => entry.entryName)
  const imagePaths = entries.filter(isImage)

  const content = [fileName, ...entries.filter(isContent)]
  const contentImages = imagePaths
    .map((ip) => {
      const scores = content.map((c) =>
        stringSimilarity.compareTwoStrings(c, ip)
      )

      const sort = Math.max(...scores) * 100

      return {
        sort,
        path: ip,
      }
    })
    .filter(({ sort }) => sort > 80)

  // If we don't find any images that match content,
  // just return all the images we found, with a sort value
  // of zero.
  if (contentImages.length === 0) {
    return imagePaths.map((p) => mapToImage(p, 0))
  }

  return contentImages.map(({ sort, path }) => mapToImage(path, sort))
}

/**
 * Quickly check the contentList property of the manifest
 * file for paths that point to an image, and return them.
 * @param manifest The meta.json file
 * @returns Array of file paths (relative to the root of the zip)
 */
const getImagePathsFromManifest = (manifest: Manifest) => {
  const images = manifest.contentList?.filter(isImage)

  return (
    images?.map((image, i) => ({
      sort: 100 - i * images.length,
      path: image,
    })) ?? []
  )
}

/**
 * Extract images (path and sort value) from a package
 * manifest. This will be done one of two ways:
 * 1. Look through the "contentList" property to find
 *    entries that are images.
 * 2. Look through the directories within the zip to find images.
 */
export default function getImages(zip: Zip, manifest: Manifest, name: string) {
  const paths = getImagePathsFromManifest(manifest)

  if (!Array.isArray(paths) || paths.length === 0) {
    return getImagesFromZip(zip, name)
  }

  return paths ?? []
}
