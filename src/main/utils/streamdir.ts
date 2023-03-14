import url from 'node:url'
import readdir from 'readdirp'

export type {
  EntryInfo as StreamEntryInfo,
  ReaddirpOptions as StreamOptions,
} from 'readdirp'

export default async function* streamdir(
  dir: URL,
  options?: readdir.ReaddirpOptions
) {
  for await (const entry of readdir(url.fileURLToPath(dir), options)) {
    yield entry
  }
}
