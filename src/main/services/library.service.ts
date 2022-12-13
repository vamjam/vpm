import logger from '@shared/logger'
import { Package } from '@shared/types'
import isValidString from '@shared/utils/isValidString'
import ElectronService from '~/services/ElectronService'
import configService from './config.service'
import packageService from './package.service'

const log = logger('library.service')

export type LibraryServiceEvents = {
  'scan:error': (error: Error) => void
  'scan:progress': (progress: number) => void

  'package:install': (packageId: string) => void
  'package:save': (packageId: string) => void
}

export type LibraryServiceActions = {
  'packages:list': () => Promise<Package[] | undefined>
  'packages:scan': () => Promise<void>

  'package:get': (pid: string) => Promise<Package | undefined>
  'package:install': (pid: string) => Promise<boolean>
  'package:save': (pid: string) => Promise<boolean>
}

class LibraryService
  extends ElectronService<LibraryServiceEvents>
  implements LibraryServiceActions
{
  async ['packages:scan']() {
    const libraryPath = configService['config:get']().library.path

    if (isValidString(libraryPath)) {
      await packageService.importPackages(libraryPath)
    } else {
      log.info(`Invalid library path: "${libraryPath}"`)
    }
  }

  async ['packages:list']() {
    return [] as Package[]
  }

  async ['package:get'](pid?: string) {
    console.log(pid)

    return {} as Package
  }

  async ['package:save'](pid?: string) {
    console.log(pid)

    return true
  }

  async ['package:install'](pid?: string) {
    console.log(pid)

    return true
  }
}

const libraryService = new LibraryService()

export default libraryService
