import { PackageType } from '@shared/enums'
import { HubPackage } from '@shared/types'
import { GetResourcesResponse } from './HubTypes'

const parseNumber = (
  value?: string | number | undefined | null
): number | null => {
  if (typeof value === 'number') {
    return value
  }

  if (value == null || value === 'null' || value === 'undefined') {
    return null
  }

  const parsed = parseInt(value, 10)

  if (Number.isNaN(parsed)) {
    return null
  }

  return parsed
}

export default function parse(data: GetResourcesResponse) {
  const results: HubPackage[] = []

  for (const resource of data.resources) {
    const [hubFile] = resource.hubFiles
    const [_, name] = hubFile.filename.split('.')

    const id = `${hubFile.creatorName}.${name}.${resource.version_string}`

    const result: HubPackage = {
      id,
      importedAt: new Date(),
      name,
      version: Number(resource.version_string),
      size: parseNumber(hubFile.file_size),
      type: PackageType.fromName(resource.type)?.value ?? null,
      createdAt: new Date(Number(resource.release_date) * 1000),
      description: resource.tag_line,
      path: '',
      instructions: null,
      credits: null,
      licenseType: hubFile.licenseType,
      // images: [{ path: resource.image_url }],
      images: [resource.image_url],
      creator: {
        name: hubFile.creatorName,
        avatar: resource.icon_url,
      },
      hub: {
        resourceId: Number(hubFile.resource_id),
        attachmentId: Number(hubFile.attachment_id),
        discussionThreadId: parseNumber(resource.discussion_thread_id),
        downloadUrl: hubFile.downloadUrl,
        title: resource.title,
        tagline: resource.tag_line,
        dependencyCount: parseNumber(resource.dependency_count),
        vamPackageId: Number(resource.package_id),
      },
    }

    results.push(result)
  }

  return results
}
