import type AssetType from '@shared/AssetType.ts'

export type ScanMessage =
  | { type: 'scan.ready' }
  | { type: 'scan.complete'; payload: { ok: boolean } }
  | { type: 'scan.error'; payload: { message: string } }
  | {
      type: 'scan.batchImported'
      payload: { count: number }
    }
  | {
      type: 'scan.assetFound'
      payload: {
        assetType: AssetType
        fileName: string
      }
    }
