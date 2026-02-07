import path from 'node:path'

export function parseFileName(filePath: string) {
  const fileName = path.basename(filePath)
  const parts = fileName.split('.')

  if (parts.length < 3) return undefined

  const [creatorName, packageName, versionAsString] = parts

  return {
    creatorName,
    packageName,
    version: parseNumber(versionAsString),
  }
}

function parseNumber(input: string): number | undefined {
  if (input.trim() === '') return undefined

  const value = Number(input)
  return Number.isFinite(value) ? value : undefined
}

export function parseArgs() {
  const args = process.argv.slice(2)
  const parsedArgs = args.reduce<Record<string, string>>((acc, arg) => {
    const [key, value] = arg.split('=')
    acc[key.replace(/^--/, '')] = value || ''
    return acc
  }, {})

  if (!parsedArgs.dir || !parsedArgs.dbPath) {
    throw new Error('Missing required arguments: dir, dbPath')
  }

  return parsedArgs
}
