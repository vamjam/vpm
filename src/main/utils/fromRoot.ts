import path from 'node:path'

export default function fromRoot(root: URL, relativePath: string) {
  return new URL(path.join(root.toString(), relativePath))
}
