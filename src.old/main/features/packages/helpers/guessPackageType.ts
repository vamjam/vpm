import path from 'node:path'
import { PackageType } from '@shared/types'
import ContentListMap from '~/features/package/maps/ContentListMap'
import { Manifest } from '~/lib/VaM'

const getContents = (
  manifest: Manifest,
  contentListIndex = 0,
  maxDepth = 3
): PackageType | undefined => {
  if (
    contentListIndex >= (manifest.contentList?.length ?? 0) ||
    contentListIndex >= maxDepth
  ) {
    return
  }

  const entry = manifest.contentList?.[contentListIndex]

  if (entry == null) {
    return
  }

  const normalizedPath = path.normalize(entry)
  const result = Object.entries(ContentListMap).find(([_, test]) => {
    return test(normalizedPath)
  })?.[0] as PackageType | undefined

  if (result != null) {
    return result
  }

  return getContents(manifest, contentListIndex + 1)
}

/**
 * Attempt to get the package type (e.g. 'Appearance', 'Clothing',
 * 'Scene', etc.) from the manifest's "contentList"
 * property, which is an array of strings to the bundled
 * content within the package.
 * Currently, we can only guess what the type might be by
 * looking at the paths to files in this package.
 */
export default function guessPackageType(manifest?: Manifest) {
  if (manifest != null) {
    return getContents(manifest)
  }

  return undefined
}
