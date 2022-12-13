import path from 'node:path'
import Zip from 'adm-zip'
import stringSimilarity from 'string-similarity'
import { Manifest } from '@shared/types'
import extensionMap from '~/services/maps/extensionMap'

const imageFileExtensions = ['.jpg', '.png']
const pkgFileExtensions = Object.values(extensionMap).flat()

const isImage = (imagePath: string) => {
  if (imagePath.includes('Texture')) {
    return false
  }

  return imageFileExtensions.includes(path.extname(imagePath))
}

const isContent = (contentPath: string) => {
  return pkgFileExtensions.includes(path.extname(contentPath))
}

const mapToImage = (imagePath: string, score: number) => ({
  path: imagePath,
  sort: score,
})

const getImagesFromZip = (zip: Zip, fileName: string) => {
  const entries = zip.getEntries().map((entry) => entry.entryName)
  const imagePaths = entries.filter(isImage)

  const content = [fileName, ...entries.filter(isContent)]
  const contentImages = imagePaths
    .map((ip) => {
      const score =
        Math.max(
          ...content.map((c) => stringSimilarity.compareTwoStrings(c, ip))
        ) * 100

      return {
        score,
        path: ip,
      }
    })
    .filter(({ score }) => score > 80)

  // If we don't find any images that match any content,
  // return all images with a score of 0.
  if (contentImages.length === 0) {
    return imagePaths.map((p) => mapToImage(p, 0))
  }

  return contentImages.map(({ score, path }) => mapToImage(path, score))
}

const getImagesFromManifest = (manifest: Manifest) => {
  const images = manifest.contentList?.filter(isImage)

  return (
    images?.map((image, i) => ({
      sort: 100 - i * images.length,
      path: image,
    })) ?? []
  )
}

/**
 * Find all possible images in this package by comparing
 * file names of the images to file names of other listed
 * (non-image) content. Typically, the images we want share
 * file names/paths with the actual content.
 */
export default function getImages(zip: Zip, manifest: Manifest, name: string) {
  // First, do a quick check to see if the manifest lists
  // any image content. If so, we proceed to unpack the zip
  // and extract the images.
  const images = getImagesFromManifest(manifest)

  if (!Array.isArray(images) || images.length === 0) {
    return getImagesFromZip(zip, name)
  }

  return images ?? []
}
