import { SetState } from 'zustand'
import { Config, Layout, Theme } from '@shared/types'
import { getSystemTheme } from '~/style/theme'
import State from '../State'

const config = (await window.api?.getConfig()) ?? ({} as Config)
const theme = config?.theme ?? getSystemTheme()

export type ConfigSlice = Required<Config> & {
  setTheme: (theme: Theme) => Promise<void>
  setLayout: (layout: Layout) => Promise<void>
  setVamInstallPaths: (...paths: string[]) => Promise<void>
}

export default function createSlice(set: SetState<State>): ConfigSlice {
  return {
    theme,
    layout: config.layout ?? 'grid',
    vamInstallPaths: config.vamInstallPaths ?? [],
    imageSaveQuality: config.imageSaveQuality,
    setTheme: async (theme: Theme) => {
      const newConfig = await window.api?.setConfig({
        theme: theme,
      })

      set({
        theme: newConfig?.theme ?? 'auto',
      })
    },
    setLayout: async (layout: Layout) => {
      const newConfig = await window.api?.setConfig({
        layout,
      })

      if (newConfig && newConfig.layout) {
        set({
          layout: newConfig.layout,
        })
      }
    },
    setVamInstallPaths: async (...paths: string[]) => {
      const newConfig = await window.api?.setConfig({
        vamInstallPaths: paths,
      })

      set({
        vamInstallPaths: newConfig?.vamInstallPaths ?? [],
      })
    },
  }
}
