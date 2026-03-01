import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./scanner.worker.ts'],
  outDir: '../../dist',
  format: ['esm'],
  tsconfig: './tsconfig.json',
  external: ['electron'],
  sourcemap: true,
  clean: false,
  fixedExtension: false,
})
