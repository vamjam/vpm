import { Stats } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { isNullOrEmpty } from '~/../shared/utils/String'
import { SaveableAsset } from '~/db/Repository'
import * as VamFileType from '~/vam/FileTypes'

export type MergeAsset = (asset: SaveableAsset) => SaveableAsset
export type ParseAsset = (filePath: string) => Promise<MergeAsset>

const getStats = async (filePath: string) => {
  try {
    const stats = await fs.stat(filePath)

    return stats
  } catch (err) {
    return undefined
  }
}

const getSize = (...stats: ({ size: number | null } | undefined)[]) => {
  return stats?.reduce((acc, curr) => acc + (curr?.size ?? 0), 0)
}

const AssetParser: Record<string, ParseAsset> = {
  // Presets
  '.vap': async (filePath) => {
    const fileName = path.basename(filePath)

    return (asset) => {
      if (fileName.startsWith('Preset_')) {
        return {
          ...asset,
          name: fileName.replace('Preset_', ''),
        }
      }

      return asset
    }
  },
  // Morphs.
  // For size, also needs .vmb and .dsf, if they exist.
  '.vmi': async (filePath) => {
    const vmb = filePath.replace('.vmi', '.vmb')
    const dsf = filePath.replace('.vmi', '.dsf')

    const vmbStats = await getStats(vmb)
    const dsfStats = await getStats(dsf)

    return (asset) => {
      const size = getSize(vmbStats, dsfStats, asset)

      if (size > 0) {
        return {
          ...asset,
          size,
        }
      }

      return asset
    }
  },
  // Clothing and Hair.
  // For size, also needs .vab and .vaj.
  '.vam': async (filePath) => {
    const data = await fs.readFile(filePath, 'utf-8')
    const json = JSON.parse(data) as VamFileType.vam

    const vab = filePath.replace('.vam', '.vab')
    const vaj = filePath.replace('.vam', '.vaj')

    const vabStats = await getStats(vab)
    const vajStats = await getStats(vaj)

    return (asset) => {
      const size = getSize(vabStats, vajStats, asset)

      if (size > 0) {
        asset.size = size
      }

      if (!isNullOrEmpty(json.creatorName)) {
        asset.creator = {
          name: json.creatorName,
        }
      }

      if (!isNullOrEmpty(json.displayName)) {
        asset.name = json.displayName
      }

      return asset
    }
  },
}

export default AssetParser
