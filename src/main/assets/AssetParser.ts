import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { AssetType } from '@shared/types'
import Repository, { SaveableAsset } from '~/db/Repository'
import streamdir from '~/utils/streamdir'
import ScanLogger from './ScanLogger'
import AddonParser from './parsers/AddonParser'
import CommonParser from './parsers/CommonParser'

type ParserParams = {
  root: URL
  filePath: string
  log: ScanLogger
  type: AssetType
}

type AssetParser = (params: ParserParams) => Promise<SaveableAsset | undefined>

export default AssetParser

export const parse = async ({
  root,
  type,
  log,
  exts,
}: {
  root: URL
  type: AssetType
  log: ScanLogger
  exts: string[]
}) => {
  const assets: number[] = []
  const errors: Error[] = []
  const dir = path.join(fileURLToPath(root))
  const files = streamdir(dir, exts)
  const parser = type === AssetType.AddonPackage ? AddonParser : CommonParser

  for await (const file of files) {
    try {
      const exists = await Repository.findAssetByPath(file.fullPath)

      if (!exists) {
        const asset = await parser({
          filePath: file.path,
          log,
          root,
          type,
        })

        if (asset != null) {
          const saved = await Repository.saveAsset(root, asset)

          if (saved != null) {
            assets.push(saved)
          }
        }
      }
    } catch (err) {
      log.error(`Unable to save asset "${file}"`, err as Error)

      errors.push(err as Error)
    }
  }

  return {
    assets,
    errors,
  }
}
