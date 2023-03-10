import { Package } from '@shared/types'

export default class Stats {
  reason: string | null = null
  result: Package | null = null
  resultURL: URL | null = null

  constructor(
    public ok: boolean,
    reasonOrResult: string | null | Package = null
  ) {
    if (typeof reasonOrResult === 'string') {
      this.reason = reasonOrResult
    } else {
      this.result = reasonOrResult
    }

    this.resultURL = new URL(this.result?.sources?.[0].url) ?? null
  }
}
