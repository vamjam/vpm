import { API } from '@shared/api'

declare global {
  interface Window {
    api?: API
  }
}

export {}
