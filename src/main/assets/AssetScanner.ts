import { AssetType } from '@shared/types'
import getVAMRoot from '~/config/getVAMRoot'
import logger from '~/logger'
import { parse } from './AssetParser'
import AssetParserMap from './AssetParserMap'
import { createScanLogger } from './ScanLogger'

const log = logger('asset.scanner')

const AssetScanner = {
  async sync() {
    const root = getVAMRoot()

    for await (const [assetType, assetInfo] of Object.entries(AssetParserMap)) {
      const assets: number[] = []
      const errors: Error[] = []
      const assetTypeNumber = Number(assetType) as AssetType
      const assetTypeName = AssetType[assetTypeNumber]
      const scanLogger = createScanLogger(log, assetTypeName)

      scanLogger.startScan()

      const result = await parse({
        root,
        exts: assetInfo.exts,
        type: assetTypeNumber,
        log: scanLogger,
      })

      assets.push(...result.assets)
      errors.push(...result.errors)

      scanLogger.stopScan(result.assets.length)
    }
  },
}

export default AssetScanner
