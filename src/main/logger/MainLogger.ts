import path from 'node:path'
import { app } from 'electron'
import * as FileStreamRotator from 'file-stream-rotator'
import ConsoleLogger from './ConsoleLogger.ts'
import { LogLevel, LoggerConfig } from './types.ts'

type FileRotator = ReturnType<typeof FileStreamRotator.getStream>

const defaultConfig: LoggerConfig = {
  level: LogLevel.INFO,
  dir: app.getPath('logs'),
  verbose: false,
  fileExtension: '.log',
  dateFormat: 'YYYYMMDD',
  frequency: 'daily',
}

export default class MainLogger extends ConsoleLogger {
  #config: LoggerConfig

  #writeStream: FileRotator | null = null

  getLogsDirectory(): string {
    return this.#config.dir
  }

  constructor(name: string, config: Partial<LoggerConfig> = {}) {
    super(name, config.level)

    this.#config = {
      ...defaultConfig,
      ...config,
    }

    this.#writeStream = FileStreamRotator.getStream({
      filename: path.join(this.#config.dir, `${this.name}-%DATE%`),
      frequency: this.#config.frequency,
      verbose: this.#config.verbose,
      date_format: this.#config.dateFormat,
      extension: this.#config.fileExtension,
      audit_file: path.join(this.#config.dir, `${this.name}-audit.json`),
    })
  }

  override write(
    level: LogLevel,
    message: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...data: any[]
  ): string | undefined {
    // Write to console
    const formattedMessage = super.write(level, message, ...data)

    // Write to file
    if (this.#writeStream && formattedMessage) {
      this.#writeStream.write(formattedMessage + '\n')
    }

    return formattedMessage
  }

  close(): void {
    if (this.#writeStream) {
      this.#writeStream.end('')
      this.#writeStream = null
    }
  }
}
