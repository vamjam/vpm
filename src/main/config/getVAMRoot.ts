import { isNullOrEmpty } from '@shared/utils/String'
import config from './config'

export default function getVAMRoot() {
  const vamRoot = config.get('vam.url')

  if (isNullOrEmpty(vamRoot)) {
    throw new Error('vam.url is not set')
  }

  return new URL(vamRoot)
}
