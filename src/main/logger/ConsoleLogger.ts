import { LogLevel } from './types.ts'

export default class ConsoleLogger {
  name: string

  #level: LogLevel

  constructor(name: string, level: LogLevel = LogLevel.INFO) {
    this.name = name
    this.#level = level
  }

  write(
    level: LogLevel,
    message: string,
    ...data: unknown[]
  ): string | undefined {
    const shouldLog = level >= this.#level

    if (!shouldLog) return

    const formattedMessage = formatMessage(level, this.name, message, ...data)

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage)
        break
      case LogLevel.INFO:
        console.info(formattedMessage)
        break
      case LogLevel.WARN:
        console.warn(formattedMessage)
        break
      case LogLevel.ERROR:
        console.error(formattedMessage)
        break
    }

    return formattedMessage
  }

  debug(message: string, ...data: unknown[]): void {
    this.write(LogLevel.DEBUG, message, ...data)
  }

  info(message: string, ...data: unknown[]): void {
    this.write(LogLevel.INFO, message, ...data)
  }

  warn(message: string, ...data: unknown[]): void {
    this.write(LogLevel.WARN, message, ...data)
  }

  error(message: string, ...data: unknown[]): void {
    this.write(LogLevel.ERROR, message, ...data)
  }
}

function formatMessage(
  level: LogLevel,
  name: string,
  message: string,
  ...data: unknown[]
): string {
  const timestamp = new Date().toISOString()
  const dataStr = data.length > 0 ? ` ${JSON.stringify(data)}` : ''
  const parsedLogLevel = `[${parseLogLevel(level)}]`

  return `[${timestamp}] ${parsedLogLevel.padEnd(7, ' ')} [${name}] ${message}${dataStr}`
}

function parseLogLevel(level: LogLevel) {
  switch (level) {
    case LogLevel.DEBUG:
      return 'DEBUG'
    case LogLevel.WARN:
      return 'WARN'
    case LogLevel.ERROR:
      return 'ERROR'
    default:
      return 'INFO'
  }
}
