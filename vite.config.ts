import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { InlineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const resolve = (p: string) => fileURLToPath(new URL(p, import.meta.url))
const root = resolve('src/renderer')
const outDir = resolve('dist/renderer')

const config: InlineConfig = {
  root,
  plugins: [react(), tsconfigPaths({ root })],
  build: {
    target: 'esnext',
    modulePreload: {
      polyfill: false,
    },
    outDir,
  },
  server: {
    watch: process.argv.includes('-w') ? {} : undefined,
  },
}

export default config
