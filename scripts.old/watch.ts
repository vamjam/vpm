import { ChildProcess, spawn } from 'node:child_process'
import electron from 'electron'
import { build, createServer } from 'vite'
import { main, preload, renderer } from './config.js'

const proc = {
  current: null as ChildProcess | null,
}

const startElectron = {
  name: 'electron-main-watcher',
  writeBundle() {
    proc.current = spawn(electron as unknown as string, ['.'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        FORCE_COLOR: 'true',
      },
    })

    proc.current.unref()
  },
}

await build({
  ...main,
  mode: 'development',
  plugins: [startElectron, ...(main.plugins ?? [])],
  build: {
    ...main.build,
    watch: {},
  },
})

await build({
  ...preload,
  mode: 'development',
  build: {
    ...preload.build,
    watch: {},
  },
})

const server = await createServer(renderer)

await server.listen()
