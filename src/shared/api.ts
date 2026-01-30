import { type IpcRenderer } from 'electron'
import applicationAPI from './generated/application.api.ts'
import assetAPI from './generated/asset.api.ts'
import configAPI from './generated/config.api.ts'
import {
  type WindowControlAPI,
  createWindowControls,
} from './window-control.api.ts'

export type { WindowControlAction } from './window-control.api.ts'

type ServiceAPI = typeof assetAPI & typeof configAPI & typeof applicationAPI

const CACHEABLE_METHOD_TTLS: Partial<Record<keyof ServiceAPI, number>> = {
  'assets.list': 5_000,
}

// const serviceEventMap: (keyof ServiceEventMap)[] = [
//   'library.created',
//   'library.updated',
// ]

type IPCMethods = {
  [K in keyof ServiceAPI]: (
    ...args: Parameters<ServiceAPI[K]>
  ) => Promise<Awaited<ReturnType<ServiceAPI[K]>>>
}

const keys = [
  ...Object.keys(assetAPI),
  ...Object.keys(configAPI),
  ...Object.keys(applicationAPI),
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handlers = new Map<string, any>()
const inFlight = new Map<string, Promise<unknown>>()
const responseCache = new Map<string, { value: unknown; expiresAt: number }>()

export type API = ReturnType<typeof createAPI>

export function createAPI(ipcRenderer: IpcRenderer) {
  const windowControls: WindowControlAPI = createWindowControls(ipcRenderer)

  const api = {
    ...windowControls,
    ...keys.reduce((acc, key) => {
      const typedKey = key as keyof ServiceAPI
      const cacheTtlMs = CACHEABLE_METHOD_TTLS[typedKey] ?? 0

      acc[typedKey] = async (...args: unknown[]) => {
        const cacheKey = `${key}:${JSON.stringify(args)}`
        const now = Date.now()

        if (cacheTtlMs > 0) {
          const cached = responseCache.get(cacheKey)
          if (cached && cached.expiresAt > now) {
            return cached.value
          }

          if (cached && cached.expiresAt <= now) {
            responseCache.delete(cacheKey)
          }
        }

        const inFlightCall = inFlight.get(cacheKey)
        if (inFlightCall) {
          return inFlightCall as Promise<
            Awaited<ReturnType<ServiceAPI[typeof typedKey]>>
          >
        }

        console.log('Invoking IPC method:', key, 'with args:', args)

        const invokePromise = ipcRenderer.invoke(key, ...args)

        const wrappedPromise = invokePromise.then((resolved) => {
          if (cacheTtlMs > 0) {
            responseCache.set(cacheKey, {
              value: resolved,
              expiresAt: Date.now() + cacheTtlMs,
            })
          }

          return resolved
        })

        inFlight.set(cacheKey, wrappedPromise)

        const finalResult = await wrappedPromise.finally(() => {
          inFlight.delete(cacheKey)
        })

        console.log('Received result:', finalResult)

        return finalResult
      }
      return acc
    }, {} as IPCMethods),
    // on<K extends keyof ServiceEventMap>(
    //   event: K,
    //   id: string,
    //   handler: ServiceEventMap[K],
    // ) {
    //   if (!serviceEventMap.includes(event)) {
    //     throw new Error(`Unsupported event type: ${String(event)}`)
    //   }

    //   const handlerToSave = (
    //     _e: unknown,
    //     ...args: Parameters<ServiceEventMap[K]>
    //   ) => {
    //     try {
    //       handler(...args)
    //     } catch (error) {
    //       console.error(`Error in handler for event ${String(event)}:`, error)
    //     }
    //   }

    //   handlers.set(id, handlerToSave)

    //   ipcRenderer.on(event, handlerToSave)
    // },
    // off<K extends keyof ServiceEventMap>(event: K, id: string) {
    //   if (!handlers.has(id)) {
    //     throw new Error(`Handler not found for event: ${String(event)}`)
    //   }

    //   const savedHandler = handlers.get(id)

    //   ipcRenderer.removeListener(event, savedHandler)
    // },
  }

  return api
}
