import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: './preload.ts',
  outDir: '../../dist',
  format: ['cjs'],
  tsconfig: './tsconfig.json',
  external: ['electron'],
  clean: false,
})
