import { ChildProcess, spawn } from 'node:child_process'

const commands = [
  ['yarn', 'build:preload'],
  ['yarn', 'dx:renderer'],
  ['yarn', 'dx:main'],
]

const children = new Set<ChildProcess>()

function startProcess(command: string, args: string) {
  const child = spawn(command, [args], {
    stdio: 'inherit',
    shell: true,
  })

  children.add(child)

  child.on('exit', (code, signal) => {
    children.delete(child)

    if (signal) {
      return
    }

    if (code && code !== 0) {
      shutdown(code)
    }
  })
}

function shutdown(code = 0) {
  for (const child of children) {
    child.kill('SIGTERM')
  }

  if (children.size === 0) {
    process.exit(code)
  } else {
    const timer = setTimeout(() => {
      for (const child of children) {
        child.kill('SIGKILL')
      }
      process.exit(code)
    }, 2000)
    timer.unref()
  }
}

process.on('SIGINT', () => shutdown(130))
process.on('SIGTERM', () => shutdown(143))

for (const [command, args] of commands) {
  startProcess(command, args)
}
