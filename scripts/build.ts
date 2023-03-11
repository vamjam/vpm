// eslint-disable-next-line @typescript-eslint/triple-slash-reference
///<reference path="./electronmon.d.ts"/>
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { TsconfigPathsPlugin } from '@esbuild-plugins/tsconfig-paths'
import electronmon from 'electronmon'
import { BuildOptions, build, context } from 'esbuild'
import PkgJSON from '../package.json' assert { type: 'json' }

const IS_DEV = process.env.NODE_ENV !== 'production'
const isWatchMode = process.argv.includes('-w')

const root = fileURLToPath(new URL('../', import.meta.url))

type useESBuildOptions = {
  entry: string
  outfile: string
  tsconfig: string
}

const buildWithESBuild = async ({
  entry,
  outfile,
  tsconfig,
}: useESBuildOptions) => {
  const buildOptions: BuildOptions = {
    entryPoints: [entry],
    bundle: true,
    external: ['node:*'].concat(Object.keys(PkgJSON.dependencies)),
    outfile,
    platform: 'node',
    target: `node${process.versions.node}`,
    minify: !IS_DEV,
    sourcemap: IS_DEV,
    plugins: [
      TsconfigPathsPlugin({
        absolute: true,
        tsconfig,
      }),
    ],
  }

  if (isWatchMode) {
    const ctx = await context(buildOptions)

    await ctx.watch()
  } else {
    await build(buildOptions)
  }
}

const mainBuildOptions: useESBuildOptions = {
  entry: path.join(root, 'src/main/index.ts'),
  outfile: path.join(root, PkgJSON.main),
  tsconfig: path.join(root, 'src/main/tsconfig.json'),
}

const preloadBuildOptions: useESBuildOptions = {
  entry: path.join(root, 'src/preload/index.ts'),
  outfile: path.join(root, PkgJSON.preload),
  tsconfig: path.join(root, 'src/preload/tsconfig.json'),
}

await buildWithESBuild(mainBuildOptions)
await buildWithESBuild(preloadBuildOptions)

if (isWatchMode) {
  await electronmon()
}
