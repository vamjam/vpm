import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/preload/preload.ts'],
  format: ['cjs'],
  tsconfig: 'src/preload/tsconfig.json',
  external: ['electron'],
  noExternal: ['@filejam/electron-procstream'],
})
