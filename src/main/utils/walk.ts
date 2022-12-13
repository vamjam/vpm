import { Dirent } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'

export default async function* walk(
  dir: string
): AsyncGenerator<Dirent & { path: string }> {
  const files = await fs.readdir(dir, { withFileTypes: true })

  for (const file of files) {
    if (file.isDirectory()) {
      yield* walk(path.join(dir, file.name))
    } else {
      yield Object.assign(file, { path: path.join(dir, file.name) })
    }
  }
}
