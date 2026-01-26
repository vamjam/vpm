import { ServiceEventMap, WindowControlAction } from '@shared/api.ts'
import { ConfigStore } from '~/config/index.ts'
import { MainLogger } from '~/logger/index.ts'
import { BrowserWindow, screen } from './electron.ts'
import { fileURLToPath, path } from './node.ts'

const dir = fileURLToPath(new URL('../', import.meta.url))

type TypedWebContents = Omit<Electron.WebContents, 'send'> & {
  send<
    K extends keyof ServiceEventMap,
    P extends Parameters<ServiceEventMap[K]>,
  >(
    channel: K,
    ...params: P
  ): void
}

type TypedBrowserWindow = Electron.BrowserWindow & {
  webContents: TypedWebContents
}

export class MainWindow extends (BrowserWindow as new (
  options?: Electron.BrowserWindowConstructorOptions,
) => TypedBrowserWindow) {
  #log: MainLogger
  #config: ConfigStore

  constructor(config: ConfigStore, log: MainLogger) {
    const renderPosition = createWindowPositioner()
    const height = config.get('window.height')
    const width = config.get('window.width')
    const x = renderPosition(config.get('window.x'), 'x', width)
    const y = renderPosition(config.get('window.y'), 'y', height)

    super({
      height,
      width,
      x,
      y,
      frame: false,
      show: false,
      transparent: true,
      titleBarStyle: 'hidden',
      backgroundMaterial: 'mica',
      vibrancy: 'window',
      visualEffectState: 'followWindow',

      webPreferences: {
        preload: path.join(dir, 'dist', 'preload.cjs'),
        enableWebSQL: false,
      },
    })

    this.#config = config
    this.#log = log

    this.setWindowButtonPosition({ x: 22, y: 22 })

    this.on('focus', () => this.webContents.send('window.focus', true))
    this.on('blur', () => this.webContents.send('window.focus', false))
  }

  override async show() {
    if (this.#config.get('app.env') === 'development') {
      this.#log.info(`Loading dev window`)
      await this.loadURL('http://localhost:5173')

      this.webContents.openDevTools()
    } else {
      await this.loadFile(path.join(dir, 'renderer/index.html'))
    }

    super.show()

    this.#log.info(`Window loaded`)
  }

  handleAction(action: WindowControlAction) {
    if (action === 'minimize') {
      this.minimize()
    } else if (action === 'close') {
      this.close()
    } else if (action === 'maximize.toggle') {
      if (this.isMaximized()) {
        this.unmaximize()
      } else {
        this.maximize()
      }
    }
  }
}

function createWindowPositioner() {
  const { bounds } = screen.getPrimaryDisplay()

  return function renderPosition(
    position: string | number,
    axis: 'x' | 'y',
    sizeValue: number,
  ): number | undefined {
    if (typeof position === 'number') {
      return position
    }

    if (position === 'center') {
      if (axis === 'x') {
        return Math.floor(bounds.width / 2 - sizeValue / 2)
      } else {
        return Math.floor(bounds.height / 2 - sizeValue / 2)
      }
    } else if (position === 'start') {
      return 0
    } else if (position === 'end') {
      if (axis === 'x') {
        return bounds.width - sizeValue
      } else {
        return bounds.height - sizeValue
      }
    }

    return undefined
  }
}
