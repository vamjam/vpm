import fs from 'node:fs/promises'
import path from 'node:path'
import { isNullOrEmpty } from '~/../shared/utils/String'
import { ConfigService } from '~/features/config'

const getLibURL = () => {
  const url = ConfigService.get<string | null>('url.library')

  if (isNullOrEmpty(url)) {
    throw new Error(`Library path not set`)
  }

  return url
}

const createSymlink = async (target: URL) => {
  const libAddons = new URL(path.join(lib, 'addons'))

  const source = type === 'SCENE' ? libScenes : libAddons

  // make sure source exists
  await fs.mkdir(source, { recursive: true })

  // copy target to source
  await fs.copyFile(target, source)

  // delete target
  await fs.unlink(target)

  // create symlink
  await fs.symlink(target, source)
}

const SymlinkService = {
  async createSceneSymlink(target: URL) {
    const lib = getLibURL()
    const dir = new URL(path.join(lib, 'scenes'))
  },
}

export default SymlinkService
