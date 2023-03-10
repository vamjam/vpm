import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { IMAGES_DIR } from '@shared/config'
import { configService } from '~/features/config'

type Token = {
  name?: string | null
  value?: string | null
}

export const TokenNames = {
  IMAGE_CACHE: '$IMAGE_CACHE',
  VAM_INSTALL: '$VAM_INSTALL',
} as const

export const ImagePathToken = {
  name: TokenNames.IMAGE_CACHE,
  value: IMAGES_DIR,
}

export const VamInstallPathToken = {
  name: TokenNames.VAM_INSTALL,
  value: configService['config:get']().vam.installPath,
}

export const encodePath = (str: string | undefined | null, token: Token) => {
  if (str == null || token.name == null || token.value == null) {
    throw new Error(`Invalid token supplied to "tokenize.encodePath"`)
  }

  return path.normalize(str).replace(path.normalize(token.value), token.name)
}

export const decodePath = (str: string | undefined | null, token: Token) => {
  if (str == null || token.name == null || token.value == null) {
    throw new Error(`Invalid token supplied to "tokenize.decodePath"`)
  }

  return pathToFileURL(
    path.normalize(str).replace(token.name, path.normalize(token.value))
  ).toString()
}

export default {
  encodePath,
  decodePath,
}
