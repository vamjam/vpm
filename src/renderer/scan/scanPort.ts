import type { ScanMessage } from '@shared/scan-messages.ts'

let port: MessagePort | null = null
let portHandler: ((event: MessageEvent) => void) | null = null
const listeners = new Set<(message: ScanMessage) => void>()

export function registerScanPort(nextPort: MessagePort) {
  if (port && portHandler) {
    port.removeEventListener('message', portHandler)
  }

  port = nextPort
  portHandler = (event) => {
    const message = event.data as ScanMessage

    if (!message || typeof message !== 'object') return
    if (!('type' in message)) return
    if (typeof message.type !== 'string' || !message.type.startsWith('scan.')) {
      return
    }

    for (const listener of listeners) {
      try {
        listener(message)
      } catch (error) {
        console.error('Scan message listener error:', error)
      }
    }
  }

  port.addEventListener('message', portHandler)
  port.start?.()
}

export function onScanMessage(listener: (message: ScanMessage) => void) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export function postScanMessage(message: ScanMessage) {
  port?.postMessage(message)
}
