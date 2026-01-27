import { AssetService } from '~/asset/asset.service.ts'
import { ConfigStore, schema } from '~/config/index.ts'
import { type MainLogger, createLogger } from '~/logger/index.ts'
import { BrowserWindow, app } from './electron.ts'
import { path } from './node.ts'

const services = {
  asset: AssetService,
} as const

type ServiceKey = keyof typeof services
type Service = InstanceType<(typeof services)[ServiceKey]>

/**
 * Main application runtime class.
 *
 * Responsibilities:
 * - Application window (MainWindow).
 * - Logging and configuration.
 * - Interface with application services.
 * - Graceful shutdown/exit.
 */
export default class Application {
  config: ConfigStore
  log: MainLogger
  window: InstanceType<typeof BrowserWindow>

  #services = new Map<ServiceKey, Service>()

  /**
   * Create a new Application.
   * Initializes configuration and logging, and creates the main window.
   */
  constructor() {
    this.config = this.#startConfig()
    this.log = this.#startLogger(this.config)
    this.window = this.#createWindow()
  }

  async initialize(): Promise<this> {
    this.log.debug('Initializing application and services...')

    for (const [name, ServiceClass] of Object.entries(services)) {
      this.#services.set(name as ServiceKey, new ServiceClass(this))
    }

    for await (const service of this.#services.values()) {
      await service.initialize()
    }

    await this.#openWindow()

    this.log.debug('Application and services initialized successfully')

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

    for await (const service of this.#services.values()) {
      if (isAsyncDisposable(service)) {
        await service[Symbol.asyncDispose]()
      } else if (isDisposable(service)) {
        service[Symbol.dispose]()
      }
    }

    this.log.info('Application shutdown complete')
  }

  #createWindow() {
    const window = new BrowserWindow({
      width: this.config.get('window.width'),
      height: this.config.get('window.height'),
      frame: false,
      show: false,
      titleBarStyle: 'hidden',
      backgroundMaterial: 'acrylic',
      webPreferences: {
        preload: path.join(app.getAppPath(), 'dist', 'preload.cjs'),
      },
    })

    return window
  }

  async #openWindow() {
    if (this.config.get('app.env') === 'development') {
      await this.window.loadURL('http://localhost:5173')

      this.window.webContents.openDevTools({
        mode: 'detach',
      })
    } else {
      await this.window.loadFile(
        path.join(app.getAppPath(), 'renderer/index.html'),
      )
    }

    this.window.show()
  }

  #startConfig() {
    const {
      properties,
      type,
      required,
      additionalProperties,
      definitions,
      ...rest
    } = schema

    return new ConfigStore({
      projectName: 'vpm',
      projectSuffix: '',
      rootSchema: {
        type,
        required,
        additionalProperties,
        definitions,
      },
      schema: properties,
      // @ts-expect-error: Other defaults live in the schema
      // as they are not dynamic
      defaults: {
        'data.path': app.getPath('userData'),
      },
    })
  }

  #startLogger(config: ConfigStore): MainLogger {
    const log = createLogger('main', {
      level: config.get('log.level'),
    })

    const isDev = config.get('app.env') === 'development'

    log.info(`Versions: ${JSON.stringify(process.versions, null, 2)}`)

    log.info(
      `Starting app in ${isDev ? 'development' : 'production'} mode with config ${JSON.stringify(
        config.store,
        null,
        2,
      )} (${config.path})`,
    )

    log.info(`Using log directory: "${log.getLogsDirectory()}"`)

    return log
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
