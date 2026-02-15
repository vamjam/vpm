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

  try {
    const { stdout } = await execFileAsync(
      'cmd.exe',
      ['/d', '/u', '/c', 'dir', '/s', '/b', '/a-d', path.join(root, `*${ext}`)],
      {
        encoding: 'buffer',
        windowsHide: true,
        maxBuffer: 128 * 1024 * 1024,
      },
    )

    const output = decodeCmdUnicodeOutput(stdout)
    return output.split('\r\n').filter(Boolean)
  } catch (e) {
    console.error((e as Error)?.message)

    return []
  }
}

function decodeCmdUnicodeOutput(output: string | Buffer) {
  if (typeof output === 'string') return output

  if (output.length >= 2 && output[0] === 0xff && output[1] === 0xfe) {
    return output.toString('utf16le', 2)
  }

  return output.toString('utf16le')
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
