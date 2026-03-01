import AssetType from '@shared/AssetType.ts'
import { Asset } from '@shared/entities.ts'
import { fsp, path } from '~/core/node.ts'
import { Service, expose } from '~/core/service.ts'
import { isImage } from '~/utils/is-image.ts'

export class ScreenshotService extends Service {
  get #root() {
    const vamPath = this.config.get('vam.path')

    if (!vamPath) return

    return path.join(vamPath, 'Saves/screenshots')
  }

  @expose('screenshots.list')
  async listScreenshots(): Promise<Asset[] | undefined> {
    if (!this.#root) return

    const files = await Promise.all(
      (await fsp.readdir(this.#root, { withFileTypes: true })).filter(
        (f) => f.isFile() && isImage(path.join(this.#root!, f.name)),
      ),
    )

    const d = new Date()

    const assets = await Promise.all(
      files.map(async (f) => {
        const stats = await fsp.stat(path.join(this.#root!, f.name))

        return {
          id: stats.uid.toString(),
          vamid: '',
          size: stats.size,
          path: f.name,
          name: f.name,
          type: AssetType.Screenshot,
          importedAt: d,
          createdAt: stats.birthtime,
          updatedAt: stats.mtime,
          description: '',
          isHidden: false,
          isFavorite: false,
          dependencies: [],
          creator: '',
          parentId: null,
        }
      }),
    )

    return assets
  }
}
