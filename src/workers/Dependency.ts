import fsp from 'node:fs/promises'
import { IZipEntry } from 'adm-zip'

/**
 * A regex that finds all "URL-looking" strings, within
 * another string. Used to find dependencies, which are
 * URL-looking strings like:
 *  "Jackaroo.JarModularExpressions.latest" or
 *  "MacGruber.Life.13" or
 *  "Scamp.AndreaMILFcollection.1:/Saves/scene/AndreaPillowHUMPING01STARTINGB.json"
 */
const depFinder = /[^"]+:\/+.+\.(\w+)/g

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

export function fromVarFileEntry(entry: IZipEntry): string[] {
  const data = entry.getData().toString('utf-8')

  return findInString(data)
}

function findInString(str: string) {
  return [...str.matchAll(depFinder)].map((dep) => dep[0])
}
