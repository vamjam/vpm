import { utilityProcess } from '~/core/electron.ts'
import { pms } from '~/core/external.ts'
import { MainLogger } from '~/logger/index.ts'

type WorkerStats = {
  name: string
  pid: number
  startTime: number
}

const workers: Map<string, WorkerStats> = new Map()

type CreateWorkerOptions = {
  log: MainLogger
  filePath: string
  serviceName: string
  args: Record<string, string | undefined>
  onMessage?: <T>(message: T) => void
}

export function createWorker({
  log,
  filePath,
  serviceName,
  args,
  onMessage,
}: CreateWorkerOptions) {
  if (workers.has(serviceName)) {
    log.warn(`Worker [${serviceName}] already exists.`)

    return
  }

  const parsedArgs = Object.entries(args).map(([key, value]) => {
    if (value == undefined) return `--${key}=`
    return `--${key}=${value}`
  })

  const worker = utilityProcess.fork(filePath, parsedArgs, {
    serviceName,
    stdio: 'pipe',
  })

  worker.stdout?.on('data', (data) => {
    if (onMessage) onMessage(data.toString().trim())
    log.info(`[${serviceName}]: ${data.toString().trim()}`)
  })

  worker.stderr?.on('data', (data) => {
    log.error(`[${serviceName}]: ${data.toString().trim()}`)
  })

  worker.once('spawn', () => {
    workers.set(serviceName, {
      name: serviceName,
      pid: worker.pid!,
      startTime: Date.now(),
    })

    log.info(`Started worker process: ${filePath}`)
  })

  worker.once('exit', (code) => {
    const duration = pms(Date.now() - workers.get(serviceName)!.startTime)

    if (code === 0) {
      log.info(`${serviceName} process exited successfully in [${duration}]`)
    } else {
      log.warn(
        `${serviceName} process exited with code [${code}] in [${duration}]`,
      )
    }

    worker.stdout?.removeAllListeners()
    worker.stderr?.removeAllListeners()
    worker.removeAllListeners()

    workers.delete(serviceName)

    log.debug(`Worker process exited gracefully: ${filePath}`)
  })

  return worker
}
