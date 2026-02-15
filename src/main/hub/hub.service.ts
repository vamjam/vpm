import AssetType from '@shared/AssetType.ts'
import { Asset } from '@shared/entities.ts'
import { Service, expose } from '~/core/service.ts'
import * as VamAPI from './VamAPI.ts'

export class HubService extends Service {
  @expose('hub.resources.list')
  async listResources(
    page: number,
    pageSize: number,
    category: VamAPI.Category,
    sort: VamAPI.Sort,
  ): Promise<Asset[] | undefined> {
    const data = await VamAPI.getResources(page, pageSize, category, sort)

    return Object.values(data?.packages ?? {})
      .filter((item) => item.resource_id != null)
      .map((item) => ({
        id: item.resource_id!.toString(),
        name: item.filename as string,
        path: item.downloadUrl as string,
        size: item.file_size as unknown as number,
        creator: item.username,
        dependencies: [] as string[],
        type: AssetType.AddonPackage,
        createdAt: new Date(),
        importedAt: new Date(),
        updatedAt: new Date(),
        isHidden: false,
        isFavorite: false,
      }))
  }
}
