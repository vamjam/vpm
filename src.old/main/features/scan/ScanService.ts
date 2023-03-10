import prettyms from 'pretty-ms'
import logger from '@shared/logger'
import { isNullOrEmpty } from '~/../shared/utils/String'
import { AddonService } from '~/features/addons'
import { ConfigService } from '~/features/config'
import { LibraryService } from '~/features/library'
import { SceneService } from '~/features/scenes'

const log = logger('scan.service')

export default class ScanService {
  /**
   * Perform a multi-pass scan of the entire library:
   *  Pass 1: ImportScan - Imports all addons and scenes
   *  Pass 2: DependencyScan - Processes dependencies for changes
   */
  static async scan() {
    await this.#scanImports()
  }

  static async #scanImports() {
    const libraries = [
      ['addons', AddonService],
      ['scenes', SceneService],
    ] as const

    await Promise.allSettled(
      libraries.map(([type, svc]) => {
        return this.#scandir(type, svc.scanLibrary)
      })
    ).catch((err) => log.error(`Error scanning library`, err))
  }

  static async #scandir(
    type: 'addons' | 'scenes',
    libraryScanner: LibraryService['scanLibrary']
  ) {
    const start = Date.now()

    try {
      const vam = new URL(ConfigService.get<string>('url.vam'))

      if (isNullOrEmpty(vam.href)) {
        log.warn(`No directory configured for VaM`)

        return
      }

      log.info(`Initializing scan for ${type}...`)

      await libraryScanner(vam)
    } catch (err) {
      log.error(`Error scanning ${type}`, err as Error)
    } finally {
      const duration = prettyms(Date.now() - start, { colonNotation: true })

      log.info(`Scanning ${type} complete in ${duration}`)
    }
  }
}
