import { ChildProcess, spawn } from 'node:child_process'
import electron from 'electron'
import { build, createServer } from 'vite'
import config from './config.json' assert { type: 'json' }

const proc = {
  current: null as ChildProcess | null,
}

const startElectron = {
  name: 'electron-main-watcher',
  writeBundle() {
    // proc.current && proc.current.kill(1)
    proc.current = null && process.exit(0)
    proc.current = spawn(electron as unknown as string, ['.'], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        FORCE_COLOR: 'true',
      },
    })
  },
}

await build({
  ...config.main,
  mode: 'development',
  plugins: [startElectron],
  build: {
    watch: {},
  },
})

await build({
  ...config.preload,
  mode: 'development',
  build: {
    watch: {},
  },
})

const server = await createServer(config.renderer)

await server.listen()
