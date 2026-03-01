import AssetType from '@shared/AssetType.ts'
import { HubAsset } from '@shared/hub.ts'
import { Service, expose } from '~/core/service.ts'
import { Category, Sort, getResources } from './VamAPI.ts'
import { ResourceDetail } from './types.ts'

export class HubService extends Service {
  @expose('hub.list')
  async listResources(
    page: number,
    pageSize: number,
    category: Category,
    sort: Sort,
  ): Promise<HubAsset[] | undefined> {
    const data = await getResources(page, pageSize, category, sort)

    console.log(`VaM Response`, data)

    return Object.values(data?.resources ?? {}).map(parseResource)
  }
}

function parseResource(resource: ResourceDetail): HubAsset {
  return {
    creator: resource.username,
    creatorId: Number(resource.user_id),
    creatorIconURL: resource.icon_url,
    imageURL: resource.image_url,
    discussionThreadId: Number(resource.discussion_thread_id),
    dependencyCount: Number(resource.dependency_count),
    description: resource.tag_line,
    viewCount: Number(resource.view_count),
    downloadCount: Number(resource.download_count),
    dependencies: null,
    id: resource.resource_id.toString(),
    name: resource.title,
    type: resource.type as AssetType,
    createdAt: new Date(Number(resource.resource_date) * 1000),
    vamid: resource.package_id,
  }
}
