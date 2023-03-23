import readdir, { ReaddirpOptions } from 'readdirp'

export type { EntryInfo as StreamEntryInfo } from 'readdirp'

type StreamOptions = Omit<ReaddirpOptions, 'fileFilter'>

export default async function* streamdir(
  dir: string,
  ext: string[],
  options?: StreamOptions
) {
  for await (const entry of readdir(dir, {
    ...options,
    fileFilter: ext.map((e) => `*${e}`),
  })) {
    yield entry
  }
}
