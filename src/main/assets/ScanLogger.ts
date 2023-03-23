import chalk from 'chalk'
import { Logger } from '~/logger'
import LoopTimeLogger from '~/utils/LoopTimeLogger'

const formatAssetLabel = (assetType: string) => {
  return `${chalk.magenta(`[${assetType}]`)}`
}

type ScanLogger = Logger & {
  info: (message: string) => void
  startScan: () => void
  stopScan: (assetsLength: number) => void
  startParse: (name: string) => void
}

export default ScanLogger

export const createScanLogger = (
  log: Logger,
  assetType: string
): ScanLogger => {
  const timer = LoopTimeLogger(log)
  const label = formatAssetLabel(assetType)
  const logInfo = (message: string) => {
    log.info(`${label}: ${message}`)
  }

  return Object.assign({}, log, {
    info: logInfo,
    startScan: () => timer.start(`${label}: Starting scan`),
    stopScan: (assetsLength: number) => {
      const message = (dur: string) => {
        return `${label}: ${assetsLength} new asset(s) added in ${dur}`
      }

      timer.stop(message)
    },
    startParse: (name: string) => logInfo(`Parsing "${name}"...`),
  })
}
