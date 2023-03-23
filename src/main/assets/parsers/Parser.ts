import { AssetType } from '@shared/types'
import { Logger } from '~/logger'

type Parser = {
  root: URL
  filePath: string
  log: Logger
  type: AssetType
}

export default Parser
