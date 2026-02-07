import { useEffect } from 'react'

export default function useMessage<T>(handleMessage: (data: T) => void) {
  useEffect(() => {
    const handleScanWorker = (event: Event) => {
      const payload = (event as CustomEvent).detail
      handleMessage(payload)
    }

    window.addEventListener('scan.worker', handleScanWorker)

    return () => {
      window.removeEventListener('scan.worker', handleScanWorker)
    }
  }, [handleMessage])
}
