import pms from 'pretty-ms'
import { Logger } from '~/logger'

const timer = (log: Logger) => {
  let timeStart = 0

  return {
    start(message?: string) {
      timeStart = Date.now()

      message && log.info(message)
    },
    stop(message?: string | ((dur: string) => string)) {
      const duration = pms(Date.now() - timeStart)

      if (message != null) {
        if (typeof message === 'string') {
          log.info(`${message} in ${duration}`)
        } else {
          log.info(message(duration))
        }
      }
    },
  }
}

export type LoopTimer = ReturnType<typeof timer>

export default function LoopTimeLogger(log: Logger) {
  return timer(log)
}
