import { type API } from '../shared/api.ts'

declare global {
  interface Window {
    api: API
  }
}
