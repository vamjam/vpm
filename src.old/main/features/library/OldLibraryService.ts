import path from 'node:path'
import { capitalCase } from 'capital-case'
import logger from '@shared/logger'
import { LibraryType, Paged } from '@shared/types'
import client from '~/db/client'
import { ConfigService } from '~/features/config'
import { SymlinkService } from '~/features/symlink'
import TypedEmitter from '~/utils/TypedEmitter'
import walk from '~/utils/walk'
import Stats from './helpers/Stats'
import importAddon from './helpers/importAddon'
import importScene from './helpers/importScene'

const log = logger('library.service')

const getURLs = () => {
  const vam = ConfigService.get<string>('path.vam')

  if (vam != null) {
    const addonsURL = new URL(path.join(vam, 'AddonPackages'))
    const scenesURL = new URL(path.join(vam, 'Saves'))

    return { addonsURL, scenesURL }
  }

  return undefined
}

export type LibraryServiceEvents = {
  'scan:progress': (name: string) => void
}

class OldLibraryService extends TypedEmitter<LibraryServiceEvents> {
  /**
   * Determines if the specified library has a valid URL
   * configured. Used mainly to detect a new installation.
   * @param type Library type, either 'ADDON' or 'SCENE'
   * @returns An object containing the status of the library
   * config and URL.
   */
  isConfigured(type: LibraryType) {
    const response = {
      status: false,
      url: null as URL | null,
    }

    const { addonsURL, scenesURL } = getURLs() ?? {}

    switch (type) {
      case 'ADDON':
        response.status = addonsURL != null
        response.url = addonsURL ?? null
        break
      case 'SCENE':
        response.status = scenesURL != null
        response.url = scenesURL ?? null
        break
    }

    return response
  }

  /**
   * Gets a paged list of packages for the specified library type.
   * @param type The type of library to get packages for
   */
  async getPackages(type: LibraryType, paged: Paged) {
    switch (type) {
      case 'SCENE':
        return (await client.LibraryPackage).find((p) => p.libraryId)
    }
  }

  /**
   * Scan the various VaM directories for packages and
   * scenes to import, if necessary, skipping any symlinks.
   */
  async scan() {
    log.info('Scanning library')

    const scans = [
      this.#scanDir('ADDON', importAddon),
      this.#scanDir('SCENE', importScene),
    ]

    await Promise.allSettled(scans).catch((err) => {
      log.error('Error scanning library', err)
    })

    log.info('Scanning library complete!')
  }

  async #scanDir(
    type: LibraryType,
    forEachCallback: (file: URL) => Promise<Stats>
  ) {
    log.info(`Initializing scan for ${type} directory...`)

    const config = this.isConfigured(type)

    if (!config.status || config.url == null) {
      log.warn(`No directory configured for ${capitalCase(type)}s`)

      return
    }

    const processScanResponse = handleScanResponse(type, config.url, this)

    log.debug(`Scanning "${config.url}"`)

    for await (const file of walk(config.url)) {
      try {
        if (file.isSymbolicLink()) {
          continue
        }

        const stats = await forEachCallback(file.url)

        await processScanResponse(stats)
      } catch (err) {
        log.error(`Error scanning "${file.url}"`, err as Error)
      }
    }

    log.debug(`Scanning "${config.url}" complete!\n`)
  }
}

const handleScanResponse =
  (type: LibraryType, file: URL, service: OldLibraryService) =>
  async (stats: Stats) => {
    if (!stats.ok || stats.result == null) {
      log.error(`Package import failed for ${file}} with ${stats.reason}`)

      return
    }

    if (stats.resultURL == null) {
      log.warn(
        `Package imported successfully, but no resultURL was returned.`,
        stats.result
      )

      return
    }

    try {
      await SymlinkService.createSymlink(type, stats.resultURL)
    } catch (err) {
      log.error(`Error creating symlink for "${file}"`, err as Error)
    } finally {
      service.emit('scan:progress', stats.result.name)
    }
  }

export default new OldLibraryService()
