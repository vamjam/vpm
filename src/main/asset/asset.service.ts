import AssetType from '@shared/AssetType.ts'
import * as entity from '@shared/entities.ts'
import { type Asset } from '@shared/types.ts'
import { app } from '~/core/electron.ts'
import { fileURLToPath, path } from '~/core/node.ts'
import { Service, expose } from '~/core/service.ts'
import { desc, eq, inArray } from '~/db/drizzle.ts'
import { createWorker } from '~/worker/worker.ts'

export class AssetService extends Service {
  constructor(...args: ConstructorParameters<typeof Service>) {
    super(...args)

    this.app.window.webContents.on('dom-ready', () =>
      this.startScannerOnDelay(),
    )

    this.config.onChange('vam.path', (newValue) => {
      if (newValue) {
        this.startScannerOnDelay()
      }
    })
  }

  startScannerOnDelay() {
    // setTimeout(() => this.startScanner(), 1000)
  }

  startScanner() {
    const vamPath = this.config.get('vam.path')

    if (!this.dbURL || !vamPath) return

    createWorker({
      log: this.log,
      filePath: path.join(app.getAppPath(), 'dist/shallow.worker.js'),
      serviceName: 'vpm scanner',
      args: {
        dir: vamPath,
        dbPath: fileURLToPath(this.dbURL),
      },
      onMessage: (data) => {
        this.app.window.webContents.postMessage('scan.worker', data)
      },
    })
  }

  @expose('assets.list')
  async listAssets(...types: AssetType[]): Promise<Asset[] | undefined> {
    const records = await this.db
      ?.select()
      .from(entity.assets)
      .where(inArray(entity.assets.type, types))
      .orderBy(desc(entity.assets.updatedAt))

    return records
  }

  @expose('assets.edit')
  async editAsset(id: string, data: Partial<Asset>): Promise<void> {
    await this.db
      ?.update(entity.assets)
      .set(data)
      .where(eq(entity.assets.id, id))
  }

  @expose('assets.delete')
  async deleteAsset(id: string): Promise<void> {
    await this.db?.delete(entity.assets).where(eq(entity.assets.id, id))
  }
}
