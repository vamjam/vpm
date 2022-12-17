import type { BrowserWindow, IpcMain } from 'electron'
import logger from '@shared/logger'
import TypedEmitter, { EventMap } from './TypedEmitter'

const log = logger('ipc.service')

/**
 * Base class that sets up an ipc channel to the renderer
 * @Events Specified events from the inherited class will
 * also emit on the renderer via window.webContents.send,
 * using the same name.
 * @Actions Any public method in an inherited class that
 * contains a colon ":", will be made callable from
 * ipcRenderer.invoke. Uses the same name from the class.
 * @other Will only attach events once.
 */
export default abstract class IpcService<
  T extends EventMap = EventMap
> extends TypedEmitter<T> {
  #attachedActions: string[] = []
  #attachedEvents: string[] = []

  attach(window: BrowserWindow, ipcMain: IpcMain, ...events: (keyof T)[]) {
    this.#attachEvents(window, ...events)

    const actions = Object.getOwnPropertyNames(
      Object.getPrototypeOf(this)
    ).filter((name) => name.includes(':')) as (keyof IpcService<T>)[]

    this.#attachActions(ipcMain, ...actions)
  }

  /**
   * Service actions that are made available to the
   * renderer. Uses the same action name in the renderer.
   * @param ipcMain
   * @param actions List of action names to attach.
   */
  #attachActions(ipcMain: IpcMain, ...actions: (keyof this)[]) {
    for (const action of actions) {
      if (this.#attachedActions.includes(action as string)) {
        log.warn('Action already attached', action)

        continue
      }

      ipcMain.handle(action as string, async (_, ...args) => {
        try {
          log.debug(
            `Action handler called for "${action as string}"`,
            args.length > 0 ? ` with args ${JSON.stringify(args, null, 2)}` : ''
          )

          const myAction = this[action]

          if (typeof myAction === 'function') {
            const result = await myAction.apply(this, args)

            return result
          } else {
            log.warn('Action not found', action)
          }
        } catch (error) {
          log.error('Action Error', error as Error)

          return null
        }
      })

      log.debug(`Attached action "${action as string}"`)

      this.#attachedActions.push(action as string)
    }
  }

  /**
   * Service events made available to the renderer. Will use
   * the same name on the renderer side.
   * @param window Electron browser window.
   * @param events List of event names to attach.
   */
  #attachEvents(window: BrowserWindow, ...events: (keyof T)[]) {
    for (const event of events) {
      if (this.#attachedEvents.includes(event as string)) {
        log.warn(`Event "${event as string}" already attached`)

        continue
      }

      // @ts-ignore: can use any here...
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.on(event, (...args: any[]) => {
        log.debug(`Event "${event as string}" emitted to webContents`, {
          ...args,
        })

        window.webContents.send(event as string, ...args)
      })

      this.#attachedEvents.push(event as string)
    }
  }
}
