import type { BrowserWindow, IpcMain } from 'electron'
import logger from '@shared/logger'
import TypedEmitter, { EventMap } from '~/utils/TypedEmitter'

const log = logger('electron.service')

/**
 * Base class for any service that wants an automatic ipc
 * tunnel to the renderer. This is done by forwarding the
 * specified events and service methods (that contains a
 * colon ":" in their name), to the renderer.
 * Only allows each event/action to be attached once.
 */
export default abstract class ElectronService<
  T extends EventMap = EventMap
> extends TypedEmitter<T> {
  #attachedActions: string[] = []
  #attachedEvents: string[] = []

  attach(window: BrowserWindow, ipcMain: IpcMain, ...events: (keyof T)[]) {
    this.#attachEvents(window, ...events)

    const actions = Object.getOwnPropertyNames(
      Object.getPrototypeOf(this)
    ).filter((name) => name.includes(':')) as (keyof ElectronService<T>)[]

    this.#attachActions(ipcMain, ...actions)
  }

  /**
   * Service actions that are made available to the
   * renderer. Will use the same action names in the renderer.
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
            args ? ` with args ${JSON.stringify(args, null, 2)}` : ''
          )

          const myAction = this[action]

          if (typeof myAction === 'function') {
            const result = await myAction.apply(this, args)

            return result
          } else {
            log.warn('action not found', action)
          }
        } catch (error) {
          log.error('error handling action', error)

          return null
        }
      })

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
        log.warn('event already attached', event)

        continue
      }

      // @ts-ignore: can use any here...
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.on(event, (...args: any[]) => {
        log.debug('emitting event to webContents', event, args)

        window.webContents.send(event as string, ...args)
      })

      this.#attachedEvents.push(event as string)
    }
  }
}
