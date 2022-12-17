import { Package } from '@shared/entities'
import logger from '@shared/logger'
import isValidString from '@shared/utils/isValidString'
import Repository from '~/db/Repository'
import { configService } from '~/features/config'
import { packageService } from '~/features/package'
import IpcService from '~/lib/IpcService'

const log = logger('library.service')

export type LibraryServiceEvents = {
  'scan:error': (error: Error) => void
  'scan:progress': (progress: number) => void

  'package:install': (packageId: string) => void
  'package:save': (packageId: string) => void
}

export type LibraryServiceActions = {
  'packages:list': (
    page?: number,
    take?: number
  ) => Promise<Package[] | undefined>
  'packages:scan': () => Promise<void>

  'package:get': (pid: number) => Promise<Package | null>
  'package:install': (pid: number) => Promise<boolean>
  'package:save': (pid: number) => Promise<boolean>
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

  async ['packages:list'](page?: number, take?: number) {
    return Repository.packages().find({
      skip: page,
      take,
    })
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
