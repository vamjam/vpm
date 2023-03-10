import process from 'node:process'
import url from 'node:url'
import chalk, { ChalkFunction } from 'chalk'
import PrettyError from 'pretty-error'
import pms from 'pretty-ms'
import * as winston from 'winston'
import config from '~/config'

type Meta = object | string | number | symbol

const prettyErr = new PrettyError()

const timestamp = winston.format.timestamp({
  format: 'HH:mm:ss A YYYY.MM.DD',
})

const levelColorMap = (level: string) => {
  switch (level) {
    case 'error':
      return chalk.red
    case 'warn':
      return chalk.yellow
    case 'info':
      return chalk.cyan
    case 'debug':
      return chalk.green
  }

  return chalk.dim
}

type TemplateParams = winston.Logform.TransformableInfo & {
  diff: number
  label: string
  meta?: Meta
  timestamp: string
}

const customFormatter = (useColor = false) => {
  const colorize = (text: string, ck?: ChalkFunction) => {
    return useColor && ck instanceof Function ? ck(text) : text
  }

  const template = ({
    level,
    message,
    label,
    timestamp,
    diff,
    meta,
  }: TemplateParams) => {
    const levelColor = levelColorMap(level)
    const header: string[] = [
      colorize(timestamp, chalk.dim),
      colorize(level.toUpperCase(), levelColor),
      colorize(`[${label}]`, chalk.white),
      colorize(`(${process.pid}):`, chalk.dim),
    ]

    const body: string[] = [header.join(' '), colorize(message, levelColor)]

    if (meta != null) {
      if (level === 'error') {
        if (useColor === true) {
          body.push(colorize(prettyErr.render(meta), chalk.red))
        } else {
          body.push(
            colorize(JSON.parse(JSON.stringify(meta, null, 2)), chalk.red)
          )
        }
      } else {
        body.push(
          colorize(JSON.parse(JSON.stringify(meta, null, 2)), chalk.gray)
        )
      }
    }

    body.push(colorize(`+${pms(diff, { compact: true })}`, chalk.dim))

    return body.join(' ')
  }

  return winston.format.printf(
    template as (info: winston.Logform.TransformableInfo) => string
  )
}

const fileOptions: winston.transports.FileTransportOptions = {
  filename: url.fileURLToPath(new URL(config.get('logs.url'))),
  level: config.get('logs.file.level'),
  handleExceptions: true,
  maxsize: 5242880, // 5MB
  maxFiles: 5,
  format: winston.format.combine(timestamp, customFormatter(false)),
}

const consoleOptions: winston.transports.ConsoleTransportOptions = {
  level: config.get('logs.console.level'),
  handleExceptions: true,
  format: winston.format.combine(
    winston.format.align(),
    timestamp,
    customFormatter(true)
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
  ...args: unknown[]
) => {
  const now = Date.now()
  const diff = now - logTimer.lastUpdated
  const opts: winston.LogEntry = { level, label, message, diff }

  if (args.length > 0) {
    opts.meta = args
  }

  logTimer.lastUpdated = now

  return winstonLogger.log(opts)
}

class Logger {
  constructor(private label: string) {}

  log<T extends unknown[]>(level: string, message: string, ...args: T) {
    return log(level, this.label, message, ...args)
  }

  info<T extends unknown[]>(message: string, ...args: T) {
    return this.log('info', message, ...args)
  }

  debug<T extends unknown[]>(message: string, ...args: T) {
    return this.log('debug', message, ...args)
  }

  warn<T extends unknown[]>(message: string, ...args: T) {
    return this.log('warn', message, ...args)
  }

  error<T extends Error>(message: string, err?: T) {
    return this.log('error', message, {
      message: err?.message ?? 'none',
      stack: err?.stack ?? 'none',
    })
  }
}

export default function logger(label: string) {
  return new Logger(label)
}
