import process from 'node:process'
import chalk, { ChalkFunction } from 'chalk'
import PrettyError from 'pretty-error'
import pms from 'pretty-ms'
import * as winston from 'winston'

export type Meta = Record<string, unknown> | string | number | symbol

const { LOG_FILE, LOG_FILE_LEVEL, LOG_CONSOLE_LEVEL } = process.env

const pe = new PrettyError()

const timestamp = winston.format.timestamp({
  format: 'hh:mm:ss A YY.MM.DD',
})

const levelColorMap = (level: string) => {
  switch (level) {
    case 'error':
      return chalk.red
    case 'warn':
      return chalk.yellow
    case 'info':
      return chalk.green
    case 'debug':
      return chalk.cyan
  }

  return chalk.dim
}

const customFormatter = ({ useColor = false }) => {
  const colorize = (text: string, ck?: ChalkFunction) =>
    useColor && ck instanceof Function ? ck(text) : text

  return winston.format.printf(
    ({ level, message, label, timestamp, diff, meta }) => {
      const levelColor = levelColorMap(level)
      const header: string[] = [
        colorize(timestamp, chalk.dim),
        colorize(level.toUpperCase(), levelColor),
        colorize(`[${label}]`, chalk.white),
        colorize(`(${process.pid}):`, chalk.dim),
      ]

      const body = [header.join(' '), colorize(message, levelColor)]

      if (meta != null) {
        if (level === 'error') {
          if (useColor === true) {
            body.push(colorize(pe.render(meta), chalk.red))
          } else {
            body.push(colorize(JSON.stringify(meta, null, 2), chalk.red))
          }
        } else {
          body.push(colorize(JSON.stringify(meta, null, 2), chalk.gray))
        }
      }

      body.push(colorize(`+${pms(diff, { compact: true })}`, chalk.dim))

      return body.join(' ')
    }
  )
}

const fileOptions: winston.transports.FileTransportOptions = {
  filename: LOG_FILE,
  level: LOG_FILE_LEVEL,
  handleExceptions: true,
  maxsize: 5242880, // 5MB
  maxFiles: 5,
  format: winston.format.combine(
    timestamp,
    customFormatter({ useColor: false })
  ),
}

const consoleOptions: winston.transports.ConsoleTransportOptions = {
  level: LOG_CONSOLE_LEVEL,
  handleExceptions: true,
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.padLevels(),
    timestamp,
    customFormatter({ useColor: true })
  ),
}

const winstonLogger = winston.createLogger({
  levels: winston.config.npm.levels,
  transports: [
    new winston.transports.File(fileOptions),
    new winston.transports.Console(consoleOptions),
  ],
  exitOnError: false,
})

const logTimer = {
  lastUpdated: Date.now(),
}

const log = (
  level: string,
  label: string,
  message: string,
  meta?: Meta | unknown
) => {
  const now = Date.now()
  const diff = now - logTimer.lastUpdated
  const opts: winston.LogEntry = { level, label, message, diff }

  if (meta != null) {
    opts.meta = meta
  }

  logTimer.lastUpdated = now

  return winstonLogger.log(opts)
}

class Logger {
  constructor(private label: string) {}

  log(level: string, message: string, meta?: Meta | unknown) {
    return log(level, this.label, message, meta)
  }

  error(message: string, err?: unknown) {
    return this.log('error', message, err)
  }

  info(message: string, meta?: Meta) {
    return this.log('info', message, meta)
  }

  debug(message: string, meta?: Meta) {
    return this.log('debug', message, meta)
  }

  warn(message: string, meta?: Meta) {
    return this.log('warn', message, meta)
  }
}

export default function logger(label: string) {
  return new Logger(label)
}

logger.error = (label: string, message: string, err?: unknown) => {
  return log('error', label, message, err)
}

logger.info = (label: string, message: string, meta?: Meta) => {
  return log('info', label, message, meta)
}
logger.debug = (label: string, message: string, meta?: Meta) => {
  return log('debug', label, message, meta)
}

logger.warn = (label: string, message: string, meta?: Meta) => {
  return log('warn', label, message, meta)
}
