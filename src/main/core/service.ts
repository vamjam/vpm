import { ConfigService } from '~/config/index.ts'
import connect from '~/db/connect.ts'
import { LibSQLDatabase } from '~/db/drizzle.ts'
import { Client } from '~/db/libsql.ts'
import { MainLogger } from '~/logger/index.ts'
import type Application from './application.ts'
import { ipcMain } from './electron.ts'
import { EventMap, TypedEmitter } from './external.ts'
import { EventEmitter } from './node.ts'

type Handler = (...args: unknown[]) => Promise<unknown> | unknown

export abstract class Service<E extends EventMap = EventMap>
  extends (EventEmitter as { new <EM extends EventMap>(): TypedEmitter<EM> })<E>
  implements Disposable
{
  config: ConfigService
  log: MainLogger
  app: Application
  db: LibSQLDatabase | null = null
  dbURL: string | null = null

  #client: Client | null = null
  #offHandlers: Handler[] = []

  constructor(app: Application) {
    super()
    this.app = app
    this.log = this.app.log
    this.config = this.app.config
  }

  override emit(channel: keyof E, ...args: Parameters<E[keyof E]>): boolean {
    this.app.window?.webContents.send(channel as string, ...args)

    return super.emit(channel, ...args)
  }

  async initialize() {
    const conn = await connect(this.config, this.log)

    this.db = conn.db
    this.dbURL = conn.url
    this.#client = conn.client

    const name = Object.getPrototypeOf(this).constructor.name

    this.log.info(`Initializing service ${name}`)
  }

  [Symbol.dispose](): void {
    const name = Object.getPrototypeOf(this).constructor.name

    this.log.info(`Shutting down ${name} and associated workers...`)

    for (const offHandler of this.#offHandlers) {
      offHandler()
    }

    this.#client?.close()
    this.#client = null

    this.db = null
  }
}

/**
 * Decorator to expose a class method over IPC.
 * @param name The IPC channel name
 */
export function expose(name: string) {
  return function <This, T extends (this: This, ...args: any[]) => any>(
    target: T,
    context: ClassMethodDecoratorContext<This, T>,
  ) {
    context.addInitializer(function () {
      const instance = this as This

      ipcMain.handle(name, (_: unknown, ...args: unknown[]) => {
        return target.apply(instance, args as Parameters<T>)
      })
    })

    return target
  }
}
