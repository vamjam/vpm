import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./shallow.worker.ts'],
  outDir: '../../dist',
  format: ['esm'],
  tsconfig: './tsconfig.json',
  external: ['electron'],
  sourcemap: true,
  clean: false,
  fixedExtension: false,
})
