import path from 'node:path'
import { Package } from '@shared/entities.realm'
import isValidString from '@shared/lib/isValidString'
import logger from '@shared/logger'
import { configService } from '~/features/config'
import IpcService from '~/utils/IpcService'
import walk from '~/utils/walk'
import importPackage from './importPackage'

const log = logger('package.service')

type PackageEvents = {
  'package:import': (pkg: Package) => void
}

class PackageService extends IpcService<PackageEvents> {
  async scan() {
    const installURL = configService.get<string, string>('vam.installPath')

    if (isValidString(installURL)) {
      await this.importPackages(new URL(installURL))
    } else {
      log.warn(`Invalid install path: "${installURL}"`)
    }
  }

  async importPackages(url: URL) {
    log.info(`Scanning directory "${url.pathname}"`)

    for await (const file of walk(url)) {
      if (!file.url.pathname.endsWith('.var')) {
        log.debug(`Skipping unknown file "${file.url.pathname}"`)
        continue
      }

      const stats = await importPackage(file.url)

      if (stats.wasImported === true) {
        if (stats.result != null) {
          this.emit('package:import', stats.result)
        } else {
          log.warn(`No result for "${file.url.pathname}"`)
        }

        continue
      }
    }

    log.debug(`Scanning "${url}" complete!\n`)
  }

  fromFileName(fileName: string) {
    const [creatorName, name, version] = path.basename(fileName).split('.')

    if (!isValidString(creatorName)) {
      throw new Error(
        `Invalid creator name "${creatorName}" for package "${fileName}"`
      )
    }

    if (!isValidString(name)) {
      throw new Error(`Invalid package name "${name}" ${fileName}`)
    }

    return {
      creatorName,
      name,
      version: Number(version),
    }
  }
}

export default new PackageService()
