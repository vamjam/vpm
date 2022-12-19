import { Package } from '@shared/entities'
import { LibraryType } from '@shared/enums'
import logger from '@shared/logger'
import isValidString from '@shared/utils/isValidString'
import Repository from '~/db/Repository'
import { configService } from '~/features/config'
import { packageService } from '~/features/package'
import IpcService from '~/lib/IpcService'
import tokenize, { ImagePathToken, VamInstallPathToken } from '~/utils/tokenize'
import hubService from '../hub/hub.service'

const log = logger('library.service')

export type LibraryServiceEvents = {
  'scan:error': (error: Error) => void
  'scan:progress': (progress: number) => void

  'package:install': (packageId: string) => void
  'package:save': (packageId: string) => void
}

export type LibraryServiceActions = {
  'packages:list': (
    type: LibraryType,
    page?: number,
    take?: number
  ) => Promise<Package[] | undefined>
  'packages:scan': () => Promise<void>

  'package:get': (pid: number) => Promise<Package | null>
  'package:install': (pid: number) => Promise<boolean>
  'package:save': (pid: number) => Promise<boolean>
}

const fromEntity = (entity: Package): Package => {
  const images = entity.images?.map((img) => ({
    ...img,
    url: tokenize.decodePath(img.url, ImagePathToken),
  }))

  return {
    ...entity,
    isInstalled: true,
    isSaved: true,
    fileCreatedAt: entity.fileCreatedAt ? new Date(entity.fileCreatedAt) : null,
    fileUpdatedAt: entity.fileUpdatedAt ? new Date(entity.fileUpdatedAt) : null,
    url: tokenize.decodePath(entity.url, VamInstallPathToken),
    creator: entity.creator ?? {},
    images: images ?? null,
  }
}

class LibraryService
  extends IpcService<LibraryServiceEvents>
  implements LibraryServiceActions
{
  async ['packages:scan']() {
    const { installPath } = configService['config:get']().vam ?? {}

    if (isValidString(installPath)) {
      await packageService.importPackages(installPath)
    } else {
      log.warn(`Invalid library path: "${installPath}": aborting scan.`)
    }
  }

  async ['packages:list'](type: LibraryType, page = 0, take = 30) {
    if (type === 'INSTALLED' || type === 'SAVED') {
      return (
        await Repository.packages().find({
          skip: page,
          take,
          relations: {
            images: true,
            creator: true,
          },
        })
      ).map(fromEntity)
    } else if (type === 'HUB') {
      return hubService.listPackages(page, take)
    }

    return undefined
  }

  async ['package:get'](pid?: number) {
    return Repository.packages().findOne({
      where: {
        id: pid,
      },
    })
  }

  async ['package:save'](pid?: number) {
    console.log(pid)

    return true
  }

  async ['package:install'](pid?: number) {
    console.log(pid)

    return true
  }
}

export default new LibraryService()
