// import { defineConfig } from 'tsdown'
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/main/index.ts'],
  outDir: './dist',
  format: ['esm'],
  tsconfig: './src/main/tsconfig.json',
  external: ['electron'],
  sourcemap: true,
  // clean: false,
  // fixedExtension: false,
})
