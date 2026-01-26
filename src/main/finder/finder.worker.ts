import klaw from 'klaw'
import { parseArgs } from '~/worker/api.ts'

const args = parseArgs()

if (!('dir' in args)) {
  throw new Error('No directory specified for finder')
}

for await (const file of klaw(args.dir, {
  depthLimit: -1,
  preserveSymlinks: true,
})) {
}
