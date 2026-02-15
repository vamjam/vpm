type StringifiedBool = 'true' | 'false'
type StringifiedNumber = `${number}`
type StringifiedShortDate = `${number}`

export type Resource = {
  downloadUrl: string | null
  file_size: StringifiedNumber | null
  filename: string | null
  licenseType: string | null
  package_id: StringifiedNumber | null
  resource_id: StringifiedNumber | null
  username: string | null
}

export type Packages = {
  packages: {
    [packageName: string]: Resource
  }
}

export type HubFile = {
  attachment_id: StringifiedNumber | null
  creatorName: string | null
  current_version_id: StringifiedNumber | null
  file_size: StringifiedNumber | null
  filename: string | null
  licenseType: string | null
  package_id: StringifiedNumber | null
  programVersion: string | null
  urlHosted: string | null
}

export type Dependency = Omit<Resource, 'username'> & {
  latest_version_string: string | null
  latest_version: StringifiedNumber | null
  latestUrl: string | null
  packageName: string | null
  promotional_link?: string | null
  version: string | null
}

export type ResourceDetail = {
  avatar_date: StringifiedShortDate | null
  category: string | null
  current_version_id: StringifiedNumber | null
  dependencies: {
    [packageName: string]: Dependency[]
  } | null
  dependency_count: number | null
  discussion_thread_id: StringifiedNumber | null
  download_count: StringifiedNumber | null
  download_url: string | null
  external_url: string | null
  hubDownloadable: StringifiedBool | null
  hubFiles: HubFile[] | null
  hubHosted: StringifiedBool | null
  icon_url: string | null
  image_url: string | null
  last_update: StringifiedShortDate | null
  package_id: StringifiedNumber | null
  parent_category_id: StringifiedNumber | null
  promotional_link: string | null
  rating_avg: StringifiedNumber | null
  rating_count: StringifiedNumber | null
  rating_weighted: StringifiedNumber | null
  reaction_score: StringifiedNumber | null
  release_date: StringifiedShortDate | null
  resource_date: StringifiedShortDate | null
  resource_id: StringifiedNumber | null
  review_count: StringifiedNumber | null
  tag_line: string | null
  tags: string | null
  thtrending_downloads_per_minute: StringifiedNumber | null
  thtrending_positive_rating_count: StringifiedNumber | null
  thtrending_positive_ratings_per_minute: StringifiedNumber | null
  title: string | null
  type: string | null
  update_count: StringifiedNumber | null
  user_id: StringifiedNumber | null
  username: string | null
  version_string: string | null
  view_count: StringifiedNumber | null
}
