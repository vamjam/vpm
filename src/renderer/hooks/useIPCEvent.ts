import { useEffect, useRef } from 'react'
import { type ServiceEventMap } from '@shared/api.ts'

export default function useIPCEvent<E extends keyof ServiceEventMap>(
  event: E,
  handler: ServiceEventMap[E],
) {
  const handlerRef = useRef<ServiceEventMap[E]>(handler)
  const idRef = useRef<string | null>(null)

  // Keep handler fresh
  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  useEffect(() => {
    if (!window.api) {
      throw new Error('window.api is not available')
    }

    idRef.current = crypto.randomUUID()

    const wrappedHandler = (...args: unknown[]) => {
      // @ts-expect-error: Cannot figure this one out, but
      // thankfully it doesn't matter
      handlerRef.current(...args)
    }

    window.api.on(event, idRef.current, wrappedHandler)

    return () => {
      if (idRef.current === null) return

      window.api.off(event, idRef.current)
    }
  }, [event])
}
