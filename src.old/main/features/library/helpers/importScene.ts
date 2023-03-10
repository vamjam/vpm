import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { Creator, Package, Source } from '@shared/types'
import connect from '~/db/client'
import { ConfigService } from '~/features/config'
import { Scene } from '~/features/vam/types'
import createId from '~/utils/createId'
import Stats from './Stats'

const creator = ConfigService.get<Creator>('user.creator')

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

export default async function importScene(file: URL) {
  const filename = path.basename(file.href)
  const client = await connect()

  try {
    // Not all files are scene files
    const validated = await validateFile(file)

    if (validated === false) {
      return new Stats(false, `Not a scene file`)
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
    const images = image ? [{ url: image, sort: 100 }] : []

    const pkg: Package = {
      id: createId(),
      name: filename,
      images,
      creator,
      type: 'SCENE',
      tags: null,
      sources: [source],
    }

    const result = await client.insert('Package', pkg)

    return new Stats(true, result)
  } catch (err) {
    return new Stats(false, (err as Error).message)
  }
}
