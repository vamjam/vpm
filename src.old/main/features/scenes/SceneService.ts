import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { SelfCreator, Source } from '@shared/types'
import { isNullOrEmpty } from '@shared/utils/String'
import { LibraryService } from '~/features/library'
import {
  PackageRepository,
  PartialDependency,
  PartialPackage,
  PartialSource,
} from '~/features/packages'
import { Scene } from '~/features/vam'
import { parseNumber } from '~/utils/parse'
import walk from '~/utils/walk'

type FileData = Pick<Source, 'size' | 'updatedAt' | 'createdAt' | 'url'>

type SceneImportData = Pick<PartialPackage, 'name' | 'creator'> &
  FileData & {
    image: Buffer | null
  }

const urlRegexFinder = /[^"]+:\/+.+\.(\w+)/g

const parseVersion = (version: string) => {
  if (isNullOrEmpty(version) || version === 'latest') {
    return 'latest'
  }

  const asNumber = parseNumber(version)

  if (asNumber == null) {
    return 'latest'
  }

  return asNumber
}

const uniqueDeps = (deps: string[]) => {
  const unique = deps.reduce((acc, dep) => {
    const [id] = dep.split(':')
    const [creatorName, name, version] = id.split('.')

    if (acc[id] == null) {
      acc[id] = {
        creatorName,
        name,
        version: parseVersion(version),
      }
    }

    return acc
  }, {} as Record<string, PartialDependency>)

  return Object.values(unique)
}

const findDependencies = (json: string) => {
  try {
    const matches = [...json.matchAll(urlRegexFinder)]
    const deps = matches.map((match) => match[0])

    return uniqueDeps(deps)
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

const getImageData = async (scene: URL) => {
  // For scenes, thumbnails appear to always have the same
  // name as the scene itself, with a .jpg extension.
  const copy = scene.href.replace('.json', '.jpg')
  const imageURL = new URL(copy)

  const hasImage = existsSync(imageURL)

  if (hasImage) {
    return fs.readFile(imageURL)
  }

  return null
}

const parse = async (file: URL) => {
  const stats = await fs.stat(file)
  const imageData = await getImageData(file)
  const fileContents = await fs.readFile(file, 'utf-8')
  const dependencies = findDependencies(fileContents)

  const source: PartialSource = {
    url: file.href,
    size: stats.size,
    createdAt: stats.birthtime,
    updatedAt: stats.mtime,
    credits: null,
    dependencies,
    description: null,
    instructions: null,
    licenseType: null,
    version: null,
    isActive: true,
  }

  const pkg: PartialPackage = {
    name: file.href,
    images: [{ data: imageData, sort: 100 }],
    creator: SelfCreator,
    sources: [source],
    tags: [],
    type: 'SCENE',
  }

  return pkg
}

const getScenesURL = (vam: URL) => {
  return new URL('Saves\\scene', vam)
}

const SceneService: LibraryService<SceneImportData> = {
  async scanLibrary(vam: URL) {
    const url = getScenesURL(vam)

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

      await PackageRepository.savePackage(parsed)
    }
  },

  async importPackage(data) {
    console.log(data)
    throw new Error('Not implemented')
  },
}

export default SceneService
