import { AssetService } from '~/asset/asset.service.ts'
import { ImportService } from '~/asset/import.service.ts'
import { ConfigService, ConfigStore } from '~/config/index.ts'
import { LibraryService } from '~/library/library.service.ts'
import { UserService } from '~/user/user.service.ts'
import { CustomEmitter } from './external.ts'
import { type MainLogger, createLogger } from './logger.ts'
import { MainWindow } from './main-window.ts'
import { EventEmitter } from './node.ts'

const services = {
  user: UserService,
  asset: AssetService,
  import: ImportService,
  library: LibraryService,
} as const

type ServiceKey = keyof typeof services
type Service = InstanceType<(typeof services)[ServiceKey]>

type ApplicationEvents = {
  'app.initialized': () => Promise<void> | void
}

/**
 * Main application runtime class.
 *
 * Responsibilities:
 * - Application window (MainWindow).
 * - Logging and configuration.
 * - Interface with application services.
 * - Graceful shutdown/exit.
 */
export default class Application extends (EventEmitter as CustomEmitter<ApplicationEvents>) {
  config: ConfigStore
  log: MainLogger
  window: MainWindow

  #services = new Map<ServiceKey, Service>()

  /**
   * Create a new Application.
   * Initializes configuration and logging, and creates the main window.
   */
  constructor() {
    super()

    this.config = new ConfigService().getConfig()

    this.log = createLogger('main', {
      level: this.config.get('log.level'),
    })

    const isDev = this.config.get('app.env') === 'development'

    this.log.info(
      `Starting app in ${isDev ? 'development' : 'production'} mode with config ${JSON.stringify(
        this.config.store,
        null,
        2,
      )}`,
    )

    this.log.info(`Using log directory: "${this.log.getLogsDirectory()}"`)

    this.window = new MainWindow(this.config, this.log)
  }

  async initialize(): Promise<this> {
    this.log.debug('Initializing application and services...')

    for (const [name, ServiceClass] of Object.entries(services)) {
      this.#services.set(
        name as ServiceKey,
        new ServiceClass(this.config, this.log, this),
      )
    }

    for await (const service of this.#services.values()) {
      await service.initialize()
    }

    await this.window.show()

    this.log.debug('Application and services initialized successfully')

    this.emit('app.initialized')

    return this
  }

  getService<
    T extends ServiceKey,
    R extends InstanceType<(typeof services)[T]>,
  >(name: T): R {
    const service = this.#services.get(name)

    if (!service) {
      throw new Error(`Service not found: ${name}`)
    }

    return service as R
  }

  async shutdown(): Promise<void> {
    this.log.debug('Shutting down application...')

    try {
      this.window.close()
    } catch {
      // If the window is already closed, ignore the error
    }

    this.removeAllListeners('app.initialized')

    for await (const service of this.#services.values()) {
      if (isAsyncDisposable(service)) {
        await service[Symbol.asyncDispose]()
      } else if (isDisposable(service)) {
        service[Symbol.dispose]()
      }
    }

    this.log.info('Application shutdown complete')
  }
}

function isDisposable(obj: unknown): obj is Disposable {
  return (
    typeof obj === 'object' &&
    obj != null &&
    Symbol.dispose in obj &&
    typeof (obj as Disposable)[Symbol.dispose] === 'function'
  )
}

function isAsyncDisposable(obj: unknown): obj is AsyncDisposable {
  return (
    typeof obj === 'object' &&
    obj != null &&
    typeof (obj as AsyncDisposable)[Symbol.asyncDispose] === 'function'
  )
}
