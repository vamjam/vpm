import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./index.ts'],
  format: ['esm'],
  tsconfig: './tsconfig.json',
  external: ['electron'],
  sourcemap: true,
})
