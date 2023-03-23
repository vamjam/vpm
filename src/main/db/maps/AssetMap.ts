import { Asset, AssetFile, AssetType, AssetTypeName } from '@shared/types'
import hashid from '@shared/utils/hashid'
import config from '~/config'
import { AssetEntityQuery } from '~/db/Repository'
import * as CreatorMap from './CreatorMap'
import * as ImageMap from './ImageMap'
import * as parse from './parse'

const VAM_ROOT = new URL(config.get('vam.url') as string)

export const fromEntity = (entities: AssetEntityQuery[]) => {
  const files = entities.reduce((result, asset) => {
    if (!result[asset['file.id']]) {
      const file: Omit<AssetFile, 'assetId'> = {
        id: hashid.encode(asset['file.id']),
        createdAt: parse.dateParser.fromEntity(asset['file.createdAt']),
        updatedAt: parse.dateParser.fromEntity(asset['file.updatedAt']),
        path: parse.pathParser.fromEntity(VAM_ROOT, asset['file.path']),
        size: asset['file.size'],
        version: asset['file.version'],
      }

      result[asset['file.id']] = file
    }

    return result
  }, {} as Record<string, Omit<AssetFile, 'assetId'>>)

  const data = entities[0]

  const asset: Asset = {
    id: hashid.encode(data.id),
    creator: CreatorMap.fromEntity({
      avatar: data['creator.avatar'],
      name: data['creator.name'],
      userId: data['creator.userId'],
      id: data['creator.id'],
    }),
    dependencies: [],
    discussionThreadId: data.discussionThreadId,
    hubDownloadable: parse.boolParser.fromEntity(data.hubDownloadable),
    hubHosted: parse.boolParser.fromEntity(data.hubHosted),
    name: data.name,
    packageId: data.packageId,
    releaseDate: parse.dateParser.fromEntity(data.releaseDate),
    resourceId: data.resourceId,
    tags: parse.arrayParser.fromEntity(data.tags),
    type: data.type ? (AssetType[data.type] as AssetTypeName) : null,
    images: ImageMap.fromEntity(data),
    files: Object.values(files),
    credits: data.credits,
    description: data.description,
    instructions: data.instructions,
    licenseType: data.licenseType,
  }

  return asset
}
