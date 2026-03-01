import AssetType from '@shared/AssetType.ts'
import { Asset, assets } from '@shared/entities.ts'
import { app } from '~/core/electron.ts'
import { fileURLToPath, path } from '~/core/node.ts'
import { Service, expose } from '~/core/service.ts'
import { desc, eq, inArray } from '~/db/drizzle.ts'
import { createWorker } from '~/worker/worker.ts'

export class AssetService extends Service {
  #timer: NodeJS.Timeout | null = null
  #unsubConfigChange: () => void

  constructor(...args: ConstructorParameters<typeof Service>) {
    super(...args)

    this.#unsubConfigChange = this.config.onChange('vam.path', (newValue) => {
      if (newValue) {
        this.startScannerOnDelay()
      }
    })
  }

  override async initialize() {
    await super.initialize()

    this.startScannerOnDelay()
  }

  override [Symbol.dispose](): void {
    this.app.window.webContents.removeAllListeners('dom-ready')
    this.#unsubConfigChange()

    if (this.#timer) {
      clearTimeout(this.#timer)
      this.#timer = null
    }

    super[Symbol.dispose]()
  }

  startScannerOnDelay() {
    if (!this.#timer) {
      this.#timer = setTimeout(() => this.startScanner(), 1000)
    }
  }

  startScanner() {
    const vamPath = this.config.get('vam.path')

    if (!this.dbURL || !vamPath) return

    createWorker({
      log: this.log,
      filePath: path.join(app.getAppPath(), 'dist/scanner.worker.js'),
      serviceName: 'vpm',
      args: {
        dir: vamPath,
        dbPath: fileURLToPath(this.dbURL),
      },
      onMessage: (data) => {
        this.app.window.webContents.postMessage('scan', data)
      },
      onExit: () => {
        if (this.#timer) {
          clearTimeout(this.#timer)

          this.#timer = null
        }
      },
    })
  }

  @expose('asset.get')
  async getAsset(id?: string): Promise<Asset | undefined> {
    if (!id) return

    const record = await this.db
      ?.select()
      .from(assets)
      .where(eq(assets.id, id))
      .limit(1)
      .get()

    return record
  }

  @expose('assets.list')
  async listAssets(...types: AssetType[]): Promise<Asset[] | undefined> {
    const records = await this.db
      ?.select()
      .from(assets)
      .where(inArray(assets.type, types))
      .orderBy(desc(assets.updatedAt))

    return records
  }

  @expose('assets.edit')
  async editAsset(id: string, data: Partial<Asset>): Promise<void> {
    await this.db?.update(assets).set(data).where(eq(assets.id, id))
  }

  @expose('assets.delete')
  async deleteAsset(id: string): Promise<void> {
    await this.db?.delete(assets).where(eq(assets.id, id))
  }
}
