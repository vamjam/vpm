import { assets, creators } from '@shared/entities.ts'
import { AssetType } from '@shared/types.ts'
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

  @expose('assets.getByType')
  async getAssetsByType(type: AssetType) {
    const records = await this.db
      ?.select()
      .from(assets)
      .leftJoin(creators, eq(assets.creatorId, creators.id))
      .where(eq(assets.type, type))

    return records?.map((r) => ({
      ...r.assets,
      creator: r.creators || null,
    }))
  }
}
