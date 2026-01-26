export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LoggerConfig {
  level: LogLevel
  dir: string
  fileExtension: string
  dateFormat: string
  verbose: boolean
  frequency: string
}
