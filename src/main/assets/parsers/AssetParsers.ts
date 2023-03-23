import fs from 'node:fs/promises'
import path from 'node:path'
import merge from 'deepmerge'
import { AssetType } from '@shared/types'
import { isNullOrEmpty } from '@shared/utils/String'
import { SaveableAsset } from '~/db/Repository'
import { Logger } from '~/logger'
import * as VamFileType from '~/vam/FileTypes'

export type MergeAsset = (asset: SaveableAsset) => SaveableAsset
export type AssetParserParams = {
  filePath: string
  assetType: AssetType
  log: Logger
}
export type ParseAsset = (params: AssetParserParams) => Promise<MergeAsset>

const getSize = (...stats: ({ size: number | null } | undefined)[]) => {
  return stats?.reduce((acc, curr) => acc + (curr?.size ?? 0), 0)
}

const splitLines = (text: string) => text.split(/\r\n|\r|\n/)

const dateFormatOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour12: false,
}

const dateFormatter = new Intl.DateTimeFormat('en-US', dateFormatOptions).format

const AssetParsers: Record<string, ParseAsset> = {
  // Scenes
  '.json': async ({ filePath, assetType }) => {
    if (assetType !== AssetType.Scene) {
      return (asset) => asset
    }

    return (asset) => {
      const fileName = path.basename(filePath, '.json')

      if (/[^0-9.]/g.test(fileName)) {
        try {
          const [maybeDate] = fileName.split('.')
          const date = new Date(parseInt(maybeDate) * 1000)

          return {
            ...asset,
            name: dateFormatter(date),
          }
        } catch {
          return asset
        }
      }

      return asset
    }
  },
  // Scripts
  '.cslist': async ({ filePath, log }) => {
    const data = await fs.readFile(filePath, 'utf8')
    const ref = {
      size: 0,
    }

    for await (const line of splitLines(data)) {
      const resourcePath = path.normalize(
        path.join(path.dirname(filePath), line.trim())
      )

      try {
        const stats = await fs.stat(resourcePath)

        ref.size += getSize(stats)
      } catch (err) {
        log.error(`Failed to open file "${resourcePath}"`, err as Error)
      }
    }

    return (asset) => {
      if (ref.size > 0) {
        return merge(asset, {
          file: {
            size: ref.size,
          },
        })
      }

      return asset
    }
  },
  // Presets
  '.vap': async ({ filePath }) => {
    const fileName = path.basename(filePath, '.vap')

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
  '.vmi': async ({ filePath }) => {
    const vmb = filePath.replace('.vmi', '.vmb')
    const dsf = filePath.replace('.vmi', '.dsf')

    const vmbStats = await fs.stat(vmb)
    const dsfStats = await fs.stat(dsf)

    return (asset) => {
      const size = getSize(vmbStats, dsfStats, asset.file)

      if (size > 0) {
        return merge(asset, {
          file: {
            size,
          },
        })
      }

      return asset
    }
  },
  // Clothing and Hair.
  // For size, also needs .vab and .vaj.
  '.vam': async ({ filePath }) => {
    const data = await fs.readFile(filePath, 'utf8')
    const json = JSON.parse(data) as VamFileType.vam

    const vab = filePath.replace('.vam', '.vab')
    const vaj = filePath.replace('.vam', '.vaj')

    const vabStats = await fs.stat(vab)
    const vajStats = await fs.stat(vaj)

    return (asset) => {
      const size = getSize(vabStats, vajStats, asset.file)

      if (size > 0) {
        asset.file.size = size
      }

      if (!isNullOrEmpty(json.creatorName)) {
        if (!asset.creator) {
          asset.creator = {
            name: json.creatorName,
            avatar: null,
            userId: null,
          }
        } else {
          asset.creator.name = json.creatorName
        }
      }

      if (!isNullOrEmpty(json.displayName)) {
        asset.name = json.displayName
      }

      return asset
    }
  },
}

export default AssetParsers
