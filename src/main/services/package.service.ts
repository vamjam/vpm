import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import Zip from 'adm-zip'
import logger from '@shared/logger'
import { Manifest, Package } from '@shared/types'
import isValidString from '@shared/utils/isValidString'
import PackageUtils from '~/../shared/utils/PackageUtils'
import { connect } from '~/data/client'
import walk from '~/utils/walk'
import ElectronService from './ElectronService'
import { configStore } from './config.service'
import getImages from './utils/getImages'
import guessPackageType from './utils/guessPackageType'
import parseFileName from './utils/parseFileName'
import saveImages from './utils/saveImages'

const log = logger('package.service')
const client = connect()

export type PackageEvents = {
  'package:import': (pkg: Package) => void
}

const vpmInstallPath = configStore.get('libary.path') as string

const isInstalled = (file: string) => file.includes(vpmInstallPath)
const isVar = (file: string) => file.endsWith('.var')

const getManifest = async (zip: Zip): Promise<Manifest | undefined> => {
  return new Promise((resolve, reject) => {
    zip.getEntry('meta.json')?.getDataAsync((data, err) => {
      if (err) {
        return reject(err)
      }

      const manifest = data?.toString('utf8')

      if (!isValidString(manifest)) {
        return reject('invalid meta.json')
      }

      try {
        const parsed = JSON.parse(manifest) as Manifest

        resolve(parsed)
      } catch (err) {
        reject(err)
      }
    })
  })
}

const importPackage = async (file: string) => {
  const { creatorName, name, version } = parseFileName(file)
  const stats = await fs.stat(file)

  const zip = new Zip(file)
  const manifest = await getManifest(zip)

  if (manifest == null) {
    log.error(`Invalid package manifest for "${file}"`)

    return
  }

  const packageType = guessPackageType(manifest)
  const images = getImages(zip, manifest, name)
  const imageText = images.length === 1 ? 'image' : 'images'

  log.debug(
    `Found ${images.length} ${imageText} for package "${PackageUtils.createKey({
      creator: {
        name: creatorName,
      },
      name,
      version,
    })}"`
  )

  const savedImages = await saveImages(
    images,
    zip,
    path.join(process.cwd(), 'images', creatorName)
  )

  const data: Omit<Package, 'id' | 'images' | 'creator' | 'tags'> = {
    credits: manifest.credits ?? null,
    description: manifest.description ?? null,
    fileCreatedAt: stats.birthtime,
    fileUpdatedAt: stats.mtime,
    instructions: manifest.instructions ?? null,
    licenseType: manifest.licenseType ?? null,
    name,
    size: stats.size,
    type: packageType ?? null,
    url: pathToFileURL(file).toString(),
    version,
  }

  const pkg = await client.varPackage.create({
    include: {
      creator: true,
      images: true,
    },
    data: {
      ...data,
      images: {
        connectOrCreate: savedImages.map((img) => {
          return {
            create: {
              url: img.url,
              type: img.type,
            },
            where: {
              url: img.url,
            },
          }
        }),
      },
      creator: {
        connectOrCreate: {
          create: {
            name: creatorName,
          },
          where: {
            name: creatorName,
          },
        },
      },
    },
  })

  return pkg
}

class PackageService extends ElectronService<PackageEvents> {
  async importPackages(url: string) {
    const records = (
      await client.varPackage.findMany({
        select: {
          url: true,
        },
      })
    ).map((r) => fileURLToPath(r.url))

    const dir = fileURLToPath(url)

    log.debug(`Scanning directory "${dir}"`)

    for await (const file of walk(dir)) {
      if (!isVar(file.path) || records.includes(path.resolve(file.path))) {
        continue
      }

      try {
        log.info(`Importing package "${file.path}"`)

        const result = await importPackage(file.path)

        if (result != null) {
          this.emit('package:import', result)
        } else {
          throw new Error(`Unable to import package "${file.path}"`)
        }
      } catch (err) {
        log.error('Failed to import package', err)
      }
    }

    log.debug(`Scanning directory complete "${dir}"`)
  }
}

export default new PackageService()
