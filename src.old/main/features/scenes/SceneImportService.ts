import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { SelfCreator } from '@shared/types'
import { ImportService } from '~/features/import'
import { Scene } from '~/features/vam'
import walk from '~/utils/walk'
import SceneRepository, {
  PartialPackage,
  PartialSource,
} from './SceneRepository'

type SceneWithThumbnail = Scene & {
  thumbnail?: string
}

const urlRegexFinder = /[^"]+:\/+.+\.(\w+)/g

const parseDeps = (deps: string[]) => {
  return deps.reduce((acc, dep) => {
    const [id] = dep.split(':')
    const [creator, name, version] = id.split('.')

    if (!acc[creator]) {
      acc[creator] = {
        [name]: version,
      }
    } else {
      acc[creator][name] = version
    }

    return acc
  }, {} as Record<string, Record<string, string>>)
}

const findDependencies = (json: string) => {
  try {
    const matches = [...json.matchAll(urlRegexFinder)]

    return matches.map((match) => match[0])
  } catch (err) {
    return []
  }
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

const findImage = (scene: URL) => {
  const copy = new URL(scene.href)

  copy.pathname = scene.pathname.replace('.json', '.jpg')

  return existsSync(copy) ? copy.href : null
}

const parse = async (file: URL) => {
  const stats = await fs.stat(file)
  const image = findImage(file)
  const images = image ? [{ url: image, sort: 100 }] : []

  const source: PartialSource = {
    url: file.href,
    size: stats.size,
    createdAt: stats.birthtime,
    updatedAt: stats.mtime,
    credits: null,
    dependencies: null,
    description: null,
    instructions: null,
    licenseType: null,
    version: null,
    isActive: true,
  }

  const pkg: PartialPackage = {
    name: file.href,
    images,
    creator: SelfCreator,
    sources: [source],
    tags: [],
    type: 'SCENE',
  }

  return pkg
}

const SceneImportService: ImportService<SceneWithThumbnail> = {
  async scan(vam: URL) {
    const url = new URL('Saves\\scene', vam)

    for await (const file of walk(url)) {
      if (file.isSymbolicLink()) {
        continue
      }

      const ext = path.extname(file.url.href)

      if (ext !== '.json') {
        continue
      }

      if (!(await validateScene(file.url))) {
        continue
      }

      // We can finally be sure we have an actual scene!
      const parsed = await parse(file.url)

      await SceneRepository.save(parsed)
    }
  },

  async import(data): Promise<void> {
    console.log(data)
    throw new Error('Not implemented')
  },
}

export default SceneImportService
