import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import logger from '@shared/logger'
import { Image, Package, Source } from '@shared/types'
import { isNullOrEmpty } from '@shared/utils/String'
import { ConfigService } from '~/features/config'
import LibraryService from '~/features/library.new/LibraryService'
import PackageRepository from '~/features/package/PackageRepository'
import { Scene } from '~/features/vam/types'
import createId from '~/utils/createId'
import walk from '~/utils/walk'
import Stats from '../Stats'

const log = logger('config')

const findImage = (scene: URL) => {
  const copy = new URL(scene.href)

  copy.pathname = scene.pathname.replace('.json', '.jpg')

  return existsSync(copy) ? copy.href : null
}

const validateScene = async (file: URL) => {
  try {
    const contents = await fs.readFile(file, 'utf-8')
    const data = JSON.parse(contents)

    return 'useSceneLoadPosition' in data && 'atoms' in data
      ? (data as Scene)
      : false
  } catch (err) {
    return false
  }
}

const validateFile = async (file: URL) => {
  if (!file.pathname.endsWith('.json')) {
    return false
  }

  return validateScene(file)
}

const parseScene = async (file: URL) => {
  const filename = path.basename(file.href)

  // Not all files are scene files
  const validated = await validateFile(file)

  if (validated === false) {
    throw new Error(`${filename} is not a valid scene file`)
  }

  const fileStats = await fs.stat(file)

  const source: Source = {
    id: createId(),
    url: file.href,
    size: fileStats.size,
    createdAt: fileStats.birthtime,
    updatedAt: fileStats.mtime,
    credits: null,
    dependencies: null,
    description: null,
    instructions: null,
    licenseType: null,
    version: null,
    isActive: true,
  }

  const image = findImage(file)
  const images = (image ? [{ url: image, sort: 100 }] : []) as Image[]

  const pkg: Package = {
    name: filename,
    images,
    type: 'SCENE',
    tags: null,
    sources: [source],
  }

  return pkg
}

export default class SceneService implements LibraryService {
  async scan(vam: URL): Promise<void> {
    const url = new URL(path.join(vam.href, 'Saves/scene'))

    for await (const file of walk(url)) {
      try {
        const scene = await parseScene(file.url)
        const result = await PackageRepository.save(scene)
      } catch (err) {
        log.error(`Unable to parse scene file: ${file.url}`, err as Error)
      }
    }
  }
  getPackages(): Promise<Package[]> {
    throw new Error('Method not implemented.')
  }
  searchPackages(query: string): Promise<Package[]> {
    throw new Error('Method not implemented.')
  }
}
