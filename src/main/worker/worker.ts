import { utilityProcess } from '~/core/electron.ts'
import { MainLogger } from '~/logger/index.ts'

export function createWorker(
  log: MainLogger,
  filePath: string,
  serviceName: string,
  args: Record<string, string | undefined> = {},
) {
  const parsedArgs = Object.entries(args).map(([key, value]) => {
    if (value == undefined) return `--${key}=`
    return `--${key}=${value}`
  })

  const worker = utilityProcess.fork(filePath, parsedArgs, {
    serviceName,
    stdio: 'pipe',
  })

  worker.stdout?.on('data', (data) => {
    log.info(`[${serviceName}]: ${data.toString().trim()}`)
  })

  worker.stderr?.on('data', (data) => {
    log.error(`[${serviceName}]: ${data.toString().trim()}`)
  })

  worker.once('spawn', () => {
    log.info(`Started worker process: ${filePath}`)
  })

  worker.once('exit', (code) => {
    if (code === 0) {
      log.info(`${serviceName} process exited successfully`)
    } else {
      log.warn(`${serviceName} process exited with code [${code}]`)
    }

    worker.stdout?.removeAllListeners()
    worker.stderr?.removeAllListeners()
    worker.removeAllListeners()
  })

  return worker
}
