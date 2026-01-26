import MainLogger from './MainLogger.ts'
import { LoggerConfig } from './types.ts'

export default function createLogger(
  name: string,
  config?: Partial<LoggerConfig>,
): MainLogger {
  return new MainLogger(name, config)
}
