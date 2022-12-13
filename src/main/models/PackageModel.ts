import slugify from '@shared/utils/slugify'

export const createId = (
  creatorName: string,
  packageName: string,
  version: string | number
) => {
  return [creatorName, packageName, version?.toString()].map(slugify).join('.')
}
