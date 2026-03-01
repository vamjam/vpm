import fsp from 'node:fs/promises'
import { IZipEntry } from 'adm-zip'
import { ManifestDependency } from './Manifest.ts'

/**
 * A regex that finds all "URL-looking" strings, within
 * another string. Used to find dependencies, which are
 * URL-looking strings like:
 *  "Jackaroo.JarModularExpressions.latest" or
 *  "MacGruber.Life.13" or
 *  "Scamp.AndreaMILFcollection.1:/Saves/scene/AndreaPillowHUMPING01STARTINGB.json"
 */
const depFinder = /[^"]+:\/+.+\.(\w+)/g

export function parseDependencies(
  data?: Record<string, ManifestDependency>,
): string[] {
  return Object.entries(data ?? {}).flatMap(([key, value]) => {
    return [key, ...parseDependencies(value.dependencies)]
  })
}

/**
 * @param filePath The path to the scene file. This is
 * typically a JSON file (.json), but this method doesn't
 * care and will work with any UTF-8 file.
 * @returns An array of dependency URLs as a string
 */
export async function fromSceneFile(filePath: string): Promise<string[]> {
  // Scene JSON files don't tend to be very large, so
  // reading them in memory is preferred.
  const data = await fsp.readFile(filePath, 'utf-8')

  return findInString(data)
}

export function fromVarFileEntry(entry?: IZipEntry | null): string[] {
  const data = entry?.getData().toString('utf-8')

  return findInString(data)
    .map((url) => {
      const depName = url.split(':').at(0)
      const parts = depName?.split('.')

      if (!parts || parts.length !== 3) return

      return depName
    })
    .filter(Boolean) as string[]
}

function findInString(str?: string) {
  return str ? [...str.matchAll(depFinder)].map((dep) => dep[0]) : []
}
