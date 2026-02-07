import { execFile } from 'node:child_process'
import fsp from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export async function findFilesByExtension(
  root: string,
  ext: string,
): Promise<string[]> {
  if (!ext.startsWith('.')) throw new Error('Extension must start with .')

  const { stdout } = await execFileAsync('cmd.exe', [
    '/c',
    'dir',
    '/s',
    '/b',
    `/a-d`,
    path.join(root, `*${ext}`),
  ])

  return stdout.split('\r\n').filter(Boolean)
}

export async function* walkFiles(
  dirPath: string,
  exts: string[],
): AsyncGenerator<string> {
  let entries: Array<import('node:fs').Dirent>

  try {
    entries = await fsp.readdir(dirPath, { withFileTypes: true })
  } catch {
    return
  }

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)

    if (entry.isDirectory()) {
      yield* walkFiles(fullPath, exts)

      continue
    }

    if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase()
      if (!exts.includes(ext)) {
        continue
      }

      yield fullPath
    }
  }
}
