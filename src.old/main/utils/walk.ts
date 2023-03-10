import { Dirent } from 'node:fs'
import fs from 'node:fs/promises'

export type DirentURL = Dirent & { url: URL }

export default async function* walk(url: URL): AsyncGenerator<DirentURL> {
  const files = await fs.readdir(url, { withFileTypes: true })

  for (const file of files) {
    const fileURL = new URL(file.name, url)

    if (file.isDirectory()) {
      yield* walk(fileURL)
    } else {
      yield Object.assign(file, {
        url: fileURL,
      })
    }
  }
}
