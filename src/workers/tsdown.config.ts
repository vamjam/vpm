import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./scan.worker.ts'],
  outDir: '../../dist',
  format: ['esm'],
  tsconfig: './tsconfig.json',
  external: ['electron'],
  sourcemap: true,
  clean: false,
  fixedExtension: false,
})
