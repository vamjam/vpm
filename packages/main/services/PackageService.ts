import path from 'node:path'
import { Package } from '@prisma/client'
import Zip from 'adm-zip'
import { PackageType } from '@shared/enums'
import { PackageExtensionMap, PackageFileLocationMap } from '@shared/maps'
import { Manifest, VarPackageScanError } from '@shared/types'
import wait from '@shared/utils/wait'
import { PrismaClient } from '~/data/client'
import * as PackageModel from '~/models/PackageModel'
import list, { ListedFile } from '~/utils/list'
import {
  deleteImages,
  getImagesFromManifest,
  getImagesFromZip,
  saveImages,
} from './ImageService'
import ScanService from './ScanService'

export default class PackageService extends ScanService {
  async deletePackage(id: string) {
    try {
      const pkg = await this.client.package.delete({
        include: {
          images: true,
          hub: true,
        },
        where: {
          id,
        },
      })

      await deleteImages(pkg.images.map((i) => i.path))
    } catch {
      console.error(`Failed to delete package "${id}"`)
    }
  }

  async scan(root?: string) {
    this.startScan()

    let importedLength = 0
    const dirs = getDirectories(root)

    if (dirs.length === 0) {
      console.error(`Invalid VaM install path: "${root}"`)
    }

    for await (const dir of dirs) {
      console.log(`Scanning ${dir}`)

      const unscannedPackages = await getUnscannedPackages(dir, this.client)

      if (unscannedPackages.length === 0) {
        console.log(`No packages found in "${dir}"`)

        continue
      }

      await wait(1)

      const { imported } = await this.#importPackages(unscannedPackages)

      importedLength += imported.length
    }

    await this.stopScan(importedLength)
  }

  async getPackages(take = 20, skip = 0) {
    return this.client.package.findMany({
      orderBy: {
        importedAt: 'desc',
      },
      skip,
      take,
      include: {
        creator: true,
        images: true,
        hub: true,
      },
    })
  }

  #getImages(zip: Zip, manifest: Manifest, name: string) {
    const images = getImagesFromManifest(manifest)

    if (!Array.isArray(images) || images.length === 0) {
      return getImagesFromZip(zip, name)
    }

    return images ?? []
  }

  async #importPackage(file: ListedFile & ParsedFileName) {
    const { creatorName, id, name, version } = file

    const zip = new Zip(file.path)
    const manifest = await getManifest(zip)

    if (manifest == null) {
      return console.error(`Invalid package (no manifest found) for "${id}"`)
    }

    const packageType = getPackageType(manifest)
    const images = this.#getImages(zip, manifest, name)
    const imageText = images.length >= 2 ? 'images' : 'image'

    console.log(`Found ${images.length} ${imageText} for package "${id}"`)

    const savedImages = await saveImages(
      images,
      zip,
      path.join(process.cwd(), 'images', creatorName)
    )

    const pkgData: Omit<Package, 'creatorId' | 'groupId'> = {
      id,
      version,
      importedAt: new Date(),
      description: manifest.description ?? null,
      type: packageType ?? null,
      credits: manifest.credits ?? null,
      licenseType: manifest.licenseType ?? null,
      instructions: manifest.instructions ?? null,
      name,
      path: file.path,
      createdAt: file.stats.birthtime,
      size: file.stats.size,
    }

    const pkg = await this.client.package.create({
      include: {
        creator: true,
        images: true,
      },
      data: {
        ...pkgData,
        images: {
          create: savedImages,
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

  async #importPackages(packages: ListedFile[]) {
    const imported = []
    const errors: VarPackageScanError[] = []
    const len = packages.length
    const groupedByCreator = groupPackagesByCreator(packages)

    const emitScanProgress = this.createScanProgressEmitter(len)

    for await (const entry of Object.entries(groupedByCreator)) {
      if (this.shouldAbortScan) {
        break
      }

      const [creatorName, creatorPackages] = entry

      const pkgText = creatorPackages.length >= 2 ? 'packages' : 'package'

      console.log(
        `Importing ${creatorPackages.length} ${pkgText} from "${creatorName}"`
      )

      for await (const file of creatorPackages) {
        if (this.shouldAbortScan) {
          break
        }

        try {
          const importedPackage = await this.#importPackage({ ...file })

          imported.push(importedPackage)

          this.emit('scan:import', importedPackage)
        } catch (err) {
          const prefix = `Failed to import package: `

          if ((err as Error)?.message == null) {
            console.error(`${prefix}${err}`)
          } else {
            console.error(`${prefix}${(err as Error).message}`)
          }

          errors.push({
            file: file.name,
            path: file.path,
            error: err,
          })
        }

        emitScanProgress()

        console.log(`Done\n`)

        await wait(0.1)
      }
    }

    return { imported, errors }
  }
}

const getDirectories = (root?: string) => {
  return root == null
    ? []
    : PackageFileLocationMap[PackageType.ADDON_PACKAGE.value].map((dir) =>
        path.join(root, dir)
      )
}

const getUnscannedPackages = async (dir: string, client: PrismaClient) => {
  const files = await list(dir, '.var')

  if (files == null || !Array.isArray(files) || files?.length === 0) {
    console.log(`No packages found in "${dir}"!`)

    return []
  }

  const currentPackages = await client.package.findMany({
    select: {
      path: true,
    },
  })

  return files.filter(({ path }) => {
    return !currentPackages.find((p) => p.path === path)
  })
}

const getManifest = async (zip: Zip): Promise<Manifest | undefined> => {
  return new Promise((resolve, reject) => {
    zip.getEntry('meta.json')?.getDataAsync((data, err) => {
      if (err) {
        return reject(err)
      }

      const manifest = data?.toString('utf8')

      if (manifest == null || manifest?.trim() === '') {
        return reject('meta.json not found')
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

const isValidString = (str?: string) => {
  return (
    str != null &&
    typeof str === 'string' &&
    str.trim() !== '' &&
    str !== 'undefined' &&
    str !== 'null'
  )
}

type ParsedFileName = {
  creatorName: string
  id: string
  name: string
  version: number
}

const parseFileName = (filePath: string): ParsedFileName => {
  const [creatorName, name, version] = path.basename(filePath).split('.')

  if (!isValidString(creatorName)) {
    throw new Error(
      `Invalid creator name "${creatorName}" for package "${filePath}"`
    )
  }

  if (!isValidString(name)) {
    throw new Error(`Invalid package name "${name}" ${filePath}`)
  }

  const id = PackageModel.createId(creatorName, name, version)

  return {
    id,
    creatorName,
    name,
    version: Number(version),
  }
}

const ContentListPackageMap = {
  [PackageType.SCENE.value]: 'Saves\\scene',
  [PackageType.CLOTHING.value]: 'Custom\\Clothing',
  [PackageType.POSE.value]: 'Custom\\Atom\\Person\\Pose',
  [PackageType.SCRIPT.value]: 'Custom\\Scripts',
  [PackageType.ASSET_BUNDLE.value]: (p: string) => {
    return (
      p.includes('Custom\\Assets') &&
      PackageExtensionMap[PackageType.ASSET_BUNDLE.value].includes(
        path.parse(p).ext
      )
    )
  },
}

const getContents = (
  manifest: Manifest,
  contentListIndex = 0,
  maxDepth = 3
): number | undefined => {
  if (
    contentListIndex >= (manifest.contentList?.length ?? 0) ||
    contentListIndex >= maxDepth
  ) {
    return
  }

  const entry = manifest.contentList?.[contentListIndex]

  if (entry == null) {
    return
  }

  const normalizedPath = path.normalize(entry)

  const result = Object.entries(ContentListPackageMap).find(([_, test]) => {
    if (typeof test === 'function') {
      return test(normalizedPath)
    }

    return normalizedPath.includes(test)
  })?.[0]

  if (result != null) {
    return Number(result)
  }

  return getContents(manifest, contentListIndex + 1)
}

const getPackageType = (manifest?: Manifest): number | undefined => {
  if (manifest != null) {
    return getContents(manifest)
  }

  return undefined
}

type VarFile<T> = T & {
  name: string
  path: string
}

const groupPackagesByCreator = <T>(packages: VarFile<T>[]) => {
  return packages.reduce((acc, curr) => {
    const parsed = parseFileName(curr.name)
    const [creatorNameSlug] = parsed.id

    acc[creatorNameSlug] = acc[creatorNameSlug] ?? []
    acc[creatorNameSlug].push({
      ...curr,
      ...parsed,
    })

    return acc
  }, {} as Record<string, (VarFile<T> & ParsedFileName)[]>)
}
