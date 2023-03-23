import path from 'node:path'
import Zip from 'adm-zip'
import { AssetType } from '@shared/types'
import AssetTypeMap from '~/assets/AssetParserMap'

const AssetMap = Object.entries(AssetTypeMap).map(([k, v]) => ({
  type: Number(k) as AssetType,
  exts: v.exts,
  dirs: v.paths.map((p) => path.normalize(p)),
}))

/**
 * Addons are nothing more than a collection of assets. On
 * the Hub, they are categorized by type, which is useful.
 * Unfortunately, the manifest file doesn't give us what
 * type the Addon is, and so we have to guess.

 * Most Addons are pretty clean and contain only a single
 * asset type, usually with a "demo" scene for
 * testing/trying out the content. So by looking at the
 * folders contained within the Addon while ignoring anything in
 * "Saves/scene", we can usually do a pretty good job of
 * guessing the type. As a fallback, we can almost always
 * just go with "Scene".
 * @param manifest The manifest file of the Addon.
 */
export default function guessPackageType(zip: Zip) {
  const entries = zip.getEntries()
  const files = entries.reduce((acc, entry) => {
    if (!entry.isDirectory) {
      acc.push(entry.entryName)
    }

    return acc
  }, [] as string[])

  const grouped = files.reduce((acc, file) => {
    if (file === 'meta.json') {
      return acc
    }

    const normalizedEntry = path.normalize(file)

    for (const asset of AssetMap) {
      const assetExt = path.extname(normalizedEntry)
      const inDir = asset.dirs.some((dir) => normalizedEntry.startsWith(dir))

      if (asset.exts.includes(assetExt) && inDir) {
        if (acc[asset.type] == null) {
          acc[asset.type] = 1
        } else {
          acc[asset.type]++
        }
      }
    }

    return acc
  }, {} as Record<AssetType, number>)

  const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1])

  if (sorted.length > 0) {
    const assetTypeNumber = Number(sorted[0][0])

    return assetTypeNumber as AssetType
  }

  return undefined
}
