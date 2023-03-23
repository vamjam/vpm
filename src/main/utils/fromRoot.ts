import path from 'node:path'
import { fileURLToPath } from 'node:url'

export default function fromRoot(root: URL, relativePath: string) {
  return new URL(path.join(fileURLToPath(root), relativePath))
}
