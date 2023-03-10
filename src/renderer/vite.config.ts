import react from '@vitejs/plugin-react'
import path from 'path'
import { InlineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import pkgJSON from '../../package.json' assert { type: 'json' }

const root = process.cwd()
const pkgRoot = path.join(root, 'src/renderer')

const externalize = (deps: Record<string, string>) => {
  const ext = Object.keys(deps)

  return [/^node:.*/, ...ext.map((dep) => new RegExp(`^${dep}.*`))]
}

const external = externalize(pkgJSON.dependencies)

const config: InlineConfig = {
  root: pkgRoot,
  plugins: [react(), tsconfigPaths({ root: pkgRoot })],
  build: {
    outDir: path.join(root, 'dist', 'renderer'),
    emptyOutDir: true,
    rollupOptions: {
      external,
    },
  },
}

export default config
