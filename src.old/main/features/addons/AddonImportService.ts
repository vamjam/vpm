import fs from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'
import Zip from 'adm-zip'
import logger from '@shared/logger'
import { isNullOrEmpty } from '@shared/utils/String'
import { ImportService } from '~/features/import'
import { SceneImportService } from '~/features/scenes'
import { Manifest, Scene } from '~/features/vam'
import walk from '~/utils/walk'
import getImages from './utils/getImages'
import guessPackageType from './utils/guessPackageType'
import imageFileExtensions from './utils/imageFileExtensions'

const log = logger('addon-import.service')

const getJSON = <T>(zip: Zip, path: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    zip.getEntry(path)?.getDataAsync((data, err) => {
      if (err) {
        reject(err)
      } else {
        try {
          const str = data?.toString('utf8')

          if (isNullOrEmpty(str)) {
            reject(new Error(`Invalid JSON data in "${path}"`))
          }

          resolve(JSON.parse(str))
        } catch (err2) {
          reject(err2)
        }
      }
    })
  })
}

const parseFileName = (file: URL) => {
  const [creatorName, name, version] = path.basename(file.href).split('.')

  if (isNullOrEmpty(creatorName)) {
    throw new Error(`Invalid creator name for file: "${file}"`)
  }

  if (isNullOrEmpty(name)) {
    throw new Error(`Invalid package name for file: ${file}`)
  }

  return {
    creatorName,
    name,
    version: Number(version),
  }
}

const handleScenes = async (zip: Zip, manifest: Manifest): Promise<void> => {
  const scenes = manifest.contentList?.filter((content) => {
    return content.startsWith(`Saves\\scene`) && content.endsWith('.json')
  })

  if (!scenes?.length) return

  log.info(`Found ${scenes.length} scene${scenes.length === 1 ? '' : 's'}`)

  for await (const scene of scenes) {
    const dir = path.dirname(scene)
    const thumbnail = manifest.contentList?.find((content) => {
      return (
        content.startsWith(dir) &&
        imageFileExtensions.includes(path.extname(content))
      )
    })

    const json = await getJSON<Scene>(zip, scene)

    await SceneImportService.import({
      ...json,
      thumbnail,
    })
  }
}

const parseAddon = async (file: URL) => {
  const { creatorName, name, version } = parseFileName(file)
  const filePath = url.fileURLToPath(file)

  const zip = new Zip(filePath)
  const manifest = await getJSON<Manifest>(zip, 'meta.json')

  if (manifest == null) {
    throw new Error(`Invalid manifest for file: "${file}"`)
  }

  const packageType = guessPackageType(manifest)

  if (packageType == null) {
    throw new Error(`Invalid package type for file: "${file}"`)
  }

  await handleScenes(zip, manifest)
  const fileStats = await fs.stat(file)
}

const AddonImportService: ImportService = {
  async scan(vam: URL) {
    const url = new URL('AddonPackages', vam)

    for await (const file of walk(url)) {
      if (file.isSymbolicLink()) {
        continue
      }

      const pkg = await parseAddon(file.url)
    }
  },

  async import(file) {
    console.log(file)

    throw new Error('Not implemented')
  },
}

export default AddonImportService
