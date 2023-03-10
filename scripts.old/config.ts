import { builtinModules } from 'node:module'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { UserConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import pkg from '../package.json' assert { type: 'json' }

const IS_PROD = process.env.NODE_ENV !== 'development'

const OUT_DIR = path.join(process.cwd(), 'dist')

// Allows importing node modules with the prefix "node:"
const nodePrefixedModules = builtinModules.map((name) => `node:${name}`)

const externalize = [
  ...nodePrefixedModules,
  ...builtinModules,
  ...Object.keys(pkg.devDependencies || {}),
  ...Object.keys(pkg.dependencies || {}),
]

const shared: UserConfig = {
  build: {
    outDir: OUT_DIR,
    target: 'node18',
    minify: IS_PROD,
    sourcemap: true,
    rollupOptions: {
      external: externalize,
    },
  },
}

export const main: UserConfig = {
  root: path.join(process.cwd(), 'src/main'),
  plugins: [tsconfigPaths()],
  build: {
    ...shared.build,
    lib: {
      entry: 'main.ts',
      formats: ['cjs'],
      fileName: () => 'main.cjs',
    },
  },
}

export const preload: UserConfig = {
  root: path.join(process.cwd(), 'src/preload'),
  plugins: [tsconfigPaths()],
  build: {
    ...shared.build,
    lib: {
      entry: 'index.ts',
      formats: ['cjs'],
      fileName: () => 'preload.cjs',
    },
  },
}

export const renderer: UserConfig = {
  root: path.join(process.cwd(), 'src/renderer'),
  plugins: [react(), tsconfigPaths()],
  build: {
    outDir: OUT_DIR,
    target: 'es2022',
  },
}
