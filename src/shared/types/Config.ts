import type { Schema } from 'electron-store'
import DotNotation from '../utils/DotNotation'

type Theme = 'light' | 'dark' | 'auto'

const defaults = {
  library: {
    path: null as string | null,
    imageQuality: 70,
  },
  theme: 'auto' as Theme,
  vam: {
    installPath: null as string | null,
  },
}

type Config = typeof defaults

export default Config

export type ConfigKey = DotNotation<Config, ConfigValue>
export type ConfigValue = string | null | number | Theme

export const configSchema: Schema<Config> = {
  library: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        format: 'uri',
        default: defaults.library.path,
      },
      imageQuality: {
        type: 'number',
        maximum: 100,
        minimum: 1,
        default: defaults.library.imageQuality,
      },
    },
  },
  theme: {
    type: 'string',
    enum: ['light', 'dark', 'auto'],
    default: defaults.theme,
  },
  vam: {
    type: 'object',
    properties: {
      installPath: {
        type: 'string',
        format: 'uri',
        default: defaults.vam.installPath,
      },
    },
  },
}
