import type { BrowserWindow, IpcMainInvokeEvent } from 'electron'
import { ipcMain } from 'electron'
import logger from '@shared/logger'

const log = logger('ipc.service')

const printArgs = (...args: unknown[]) => {
  const argsStr =
    args.length > 0 ? ` with args ${JSON.stringify(args, null, 2)}` : ''

  return argsStr
}

const createIpcHandler = <T>(obj: T, action: keyof T) => {
  const myAction = obj[action]

  return async (_: IpcMainInvokeEvent, ...args: unknown[]) => {
    try {
      log.debug(
        `Action handler called for "${action as string}"`,
        printArgs(...args)
      )

      return typeof myAction === 'function'
        ? myAction.apply(obj, args)
        : log.warn('Action not found', action) && null
    } catch (error) {
      log.error('Action Error', error as Error)

      return null
    }
  }
}

/**
 * Specify a list of methods on an object to expose to the
 * Renderer process. All parameters and returns are
 * serialized via the structured clone alogrithm.
 * @param obj An object to expose methods from
 * @param actions A list of method names from the object
 */
export const exposeMethods = <T>(
  obj: T,
  namespace: string,
  ...actions: (keyof T)[]
) => {
  for (const action of actions) {
    const actionName = `${namespace}:${action.toString()}`

    ipcMain.handle(actionName, createIpcHandler(obj, action))
  }

  return obj
}

/**
 * Automatically forward the specified events from an object to the
 * renderer process. All parameters and returns are
 * serialized via the structured clone algorithm.
 * @param obj An object to forward events from.
 * @param window Electron browser window.
 * @param events List of event names to forward.
 */
export const forwardEvents = <T, TEvents>(
  obj: T,
  window: BrowserWindow,
  ...events: (keyof TEvents)[]
) => {
  for (const event of events) {
    // @ts-ignore: can use any here...
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    obj.on(event, (...args: any[]) => {
      log.debug(`Event "${event as string}" emitted to webContents`, {
        ...args,
      })

      window.webContents.send(event as string, ...args)
    })
  }

  return obj
}
