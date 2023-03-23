import pms from 'pretty-ms'
import { fileURLToPath } from 'url'
import { isNullOrEmpty } from '@shared/utils/String'
import config from '~/config'
import { Logger } from '~/logger'

export type ScanAdapter = {
  sync: (root: string) => Promise<void>
}

const getScanDuration = (startTime: number) => {
  return pms(Date.now() - startTime)
}

const getRoot = () => {
  const rootURLString = config.get('vam.url')

  if (isNullOrEmpty(rootURLString)) {
    throw new Error('vam.url is not set')
  }

  return fileURLToPath(new URL(rootURLString))
}

export default function Scanner(
  type: string,
  log: Logger,
  scanner: ScanAdapter
) {
  return {
    async sync() {
      const startTime = Date.now()
      const root = getRoot()

      log.info(`${type} scan started at ${root}`)

      await scanner.sync(root)

      const duration = getScanDuration(startTime)

      log.info(`${type} scan completed in ${duration}`)
    },
  }
}
