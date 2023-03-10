import path from 'node:path'
import isValidString from '@shared/lib/isValidString'

export default function parseFileName(filePath: string) {
  const [creatorName, name, version] = path.basename(filePath).split('.')

  if (!isValidString(creatorName)) {
    throw new Error(
      `Invalid creator name "${creatorName}" for package "${filePath}"`
    )
  }

  if (!isValidString(name)) {
    throw new Error(`Invalid package name "${name}" ${filePath}`)
  }

  return {
    creatorName,
    name,
    version: Number(version),
  }
}
