import path from 'node:path'

export function parseFileName(filePath: string) {
  const fileName = path.basename(filePath)

  const [creatorName, packageName, version] = fileName.split('.')

  return {
    creatorName,
    packageName,
    version,
  }
}
