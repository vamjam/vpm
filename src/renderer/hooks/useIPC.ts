import { useEffect, useState } from 'react'
import { type API } from '@shared/api.ts'

const TIMEOUT_SECONDS = 10

export default function useIPC<
  K extends keyof API,
  R = Awaited<ReturnType<API[K]>>,
>(method: K, ...args: Parameters<API[K]>) {
  const [data, setData] = useState<R | undefined>()
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const argsKey = JSON.stringify(args)

  useEffect(() => {
    if (!window.api) {
      throw new Error('window.api is not available')
    }

    const controller = new AbortController()
    const { signal } = controller

    callAbortableAPI(signal, method, ...JSON.parse(argsKey))
      .then((result) => {
        setIsLoading(true)
        setError(null)

        setData(result as R)
      })
      .catch((err) => {
        if (err?.name === 'AbortError') {
          console.info(`API call to ${String(method)} was aborted`)
        } else {
          setError(err as Error)
        }
      })
      .finally(() => {
        if (!signal.aborted) {
          setIsLoading(false)
        }
      })

    return () => {
      controller.abort()
    }
  }, [argsKey, method])

  return {
    data,
    error,
    isLoading,
  }
}

async function callAbortableAPI<
  K extends keyof API,
  T extends Parameters<API[K]>,
  R extends Awaited<ReturnType<API[K]>>,
>(signal: AbortSignal, method: K, ...args: T): Promise<R> {
  if (signal.aborted) {
    throw new DOMException('Aborted', 'AbortError')
  }

  const apiMethod = window.api[method] as (...args: T) => Promise<R | void>

  return new Promise<R>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new DOMException('Timeout', 'AbortError'))
    }, TIMEOUT_SECONDS * 1000)

    const cleanup = () => {
      clearTimeout(timeoutId)
      signal.removeEventListener('abort', onAbort)
    }

    const onAbort = () => {
      cleanup()
      reject(new DOMException('Aborted', 'AbortError'))
    }

    signal.addEventListener('abort', onAbort)

    apiMethod(...args)
      .then((result) => {
        resolve(result as R)
      })
      .catch((err) => {
        reject(err)
      })
      .finally(() => cleanup())
  })
}
