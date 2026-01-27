import * as entity from '@shared/entities.ts'
import { type Asset, AssetType } from '@shared/types.ts'
import { app } from '~/core/electron.ts'
import { fileURLToPath, path } from '~/core/node.ts'
import { Service, expose } from '~/core/service.ts'
import { eq } from '~/db/drizzle.ts'
import { createWorker } from '~/worker/worker.ts'

export class AssetService extends Service {
  constructor(...args: ConstructorParameters<typeof Service>) {
    super(...args)

    this.app.window.on('show', this.startImportWorker.bind(this))
  }

  startImportWorker() {
    if (!this.dbURL || !this.config.get('vam.path')) return

    createWorker(
      this.log,
      path.join(app.getAppPath(), 'dist/import.worker.js'),
      'ImportWorker',
      {
        dir: this.config.get('vam.path'),
        dbPath: fileURLToPath(this.dbURL),
      },
    )
  }

  @expose('assets.list')
  async listAssets(type: AssetType): Promise<Asset[] | undefined> {
    const records = await this.db
      ?.select()
      .from(entity.assets)
      .leftJoin(
        entity.creators,
        eq(entity.assets.creatorId, entity.creators.id),
      )
      .where(eq(entity.assets.type, type))

    return records?.map((r) => ({
      ...r.assets,
      creator: r.creators || null,
    }))
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
