export type RequestPayload = {
  action: string
  category: string
  latest_image: 'Y' | 'N'
  location: string
  page: string
  perpage: string
  sort: string
  source: 'VaM'
}

export type ErrorResponse = {
  status: 'error'
  error: string
}

export type SuccessResponse = {
  status: 'success'
}

export type UnknownResponse = {
  status?: string
}

type PaginationProp =
  | 'next_page'
  | 'page'
  | 'perpage'
  | 'prev_page'
  | 'total_found'
  | 'total_pages'

type ParameterProp =
  | 'action'
  | 'category'
  | 'location'
  | 'min_tag_ct'
  | 'min_user_ct'
  | 'page'
  | 'perpage'
  | 'search'
  | 'searchall'
  | 'sort'
  | 'source'
  | 'tags'
  | 'type'
  | 'username'

// type Response = Record<ResponseProp, string>
type Pagination = Record<PaginationProp, string>
type Parameters = Record<ParameterProp, string>

type PackageMetaProp =
  | 'filename'
  | 'file_size'
  | 'licenseType'
  | 'package_id'
  | 'resource_id'
  | 'downloadUrl'

export type PackageMeta = Record<PackageMetaProp, string>

type HubFileProp =
  | PackageMetaProp
  | 'programVersion'
  | 'urlHosted'
  | 'creatorName'
  | 'attachment_id'

export type HubFile = Record<HubFileProp, string>

export type ResourceProp =
  | 'avatar_date'
  | 'category'
  | 'current_version_id'
  | 'dependency_count'
  | 'discussion_thread_id'
  | 'download_count'
  | 'download_url'
  | 'external_url'
  | 'hubDownloadable'
  | 'hubHosted'
  | 'icon_url'
  | 'image_url'
  | 'last_update'
  | 'package_id'
  | 'parent_category_id'
  | 'promotional_link'
  | 'rating_avg'
  | 'rating_count'
  | 'rating_weighted'
  | 'reaction_score'
  | 'release_date'
  | 'resource_date'
  | 'resource_id'
  | 'review_count'
  | 'tag_line'
  | 'tags'
  | 'thtrending_downloads_per_minute'
  | 'thtrending_positive_rating_count'
  | 'thtrending_positive_ratings_per_minute'
  | 'title'
  | 'type'
  | 'update_count'
  | 'user_id'
  | 'username'
  | 'version_string'
  | 'view_count'

export type Resource = Record<ResourceProp, string> & {
  hubFiles: HubFile[]
}

type DependencyProp =
  | PackageMetaProp
  | 'packageName'
  | 'version'
  | 'latest_version'
  | 'latest_version_string'
  | 'resource_id'
  | 'latestUrl'
  | 'promotional_link'

type Dependency = Record<DependencyProp, string>

export type GetResourcesResponse = SuccessResponse & {
  pagination: Pagination
  parameters: Parameters
  resources: Resource[]
}

export type GetResourceDetailResponse = SuccessResponse &
  Resource & {
    dependencies: Record<string, Dependency[]>
  }

export type GetInfoResponse = SuccessResponse & {
  category: string[]
  last_update: string
  location: string[]
  other_options: {
    search: string
    searchall: string
  }
  parameters: Parameters
  sort: string[]
  tags: {
    [tag: string]: {
      ct: number
    }
  }
  type: string[]
}

export type FindPackagesResponse = SuccessResponse & {
  packages: Record<string, PackageMeta>
}
