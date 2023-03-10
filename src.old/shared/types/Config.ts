import DotNotation from '../lib/DotNotation'

type Theme = 'light' | 'dark' | 'auto'

export const configDefaults = {
  url: {
    db: null as string | null,
    images: null as string | null,
    vam: null as string | null,
    library: null as string | null,
  },
  library: {
    imageQuality: 70,
  },
  theme: 'auto' as Theme,
}

type Config = typeof configDefaults

export default Config

export type ConfigValue = string | null | number | Theme
export type ConfigKey = DotNotation<Config, ConfigValue>
