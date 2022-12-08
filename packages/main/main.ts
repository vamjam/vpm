import path from 'node:path'
import process from 'node:process'
import { BrowserWindow, app, dialog, ipcMain } from 'electron'
import { ApiEvent, Config } from '@shared/types'
import wait from '@shared/utils/wait'
import ConfigService from '~/services/ConfigService'
import PackageService from '~/services/PackageService'
import HubService from './services/HubService'

const isDev = process.env.NODE_ENV !== 'production'

const createWindow = async () => {
  const mainWindow = new BrowserWindow({
    height: 800,
    width: 1200,
    frame: false,
    show: false,
    backgroundColor: '#1C1C1C',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#1c1c1c',
      symbolColor: '#fff',
      // symbolColor: '#65d4e7',
    },
    webPreferences: {
      nodeIntegration: false, // default in Electron >= 5
      contextIsolation: true, // default in Electron >= 12
      // turned on, ONLY in DEV, to allow loading of local
      // files (images) when using the dev server
      webSecurity: isDev ? false : true,
      nodeIntegrationInWorker: true, // multi-threading!
      preload: path.join(__dirname, 'preload.cjs'),
    },
  })

  mainWindow.once('ready-to-show', () => mainWindow.show())

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    await wait(1)

    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, 'index.html'))
  }

  const logCallback = (channel: ApiEvent) => {
    return function log(message?: unknown, ...optionalParams: unknown[]) {
      mainWindow.webContents.send(channel, message, ...optionalParams)
    }
  }

  const onReady = function onReady() {
    console.log = logCallback('log:info')
    console.warn = logCallback('log:warn')
    console.error = logCallback('log:err')
  }

  mainWindow.webContents.once('dom-ready', onReady)

  const packageService = new PackageService()
  const hubService = new HubService()

  const attachScanEvents = (event: ApiEvent) => {
    packageService.on(event, (...args: unknown[]) => {
      mainWindow.webContents.send(event, ...args)
    })
  }

  attachScanEvents('scan:start')
  attachScanEvents('scan:stop')
  attachScanEvents('scan:progress')
  attachScanEvents('scan:error')

  ipcMain.handle('dialog:openDirectory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
    })

    return canceled ? undefined : filePaths[0]
  })

  ipcMain.handle('config:get', async () => {
    return ConfigService.getConfig()
  })

  ipcMain.handle('config:set', async (_, config: Partial<Config>) => {
    return ConfigService.saveConfig(config)
  })

  ipcMain.handle('scan', async () => {
    const config = await ConfigService.getConfig()
    const root = config.vamInstallPaths?.[0]

    return packageService.scan(root)
  })

  ipcMain.handle('scan:abort', async () => {
    return packageService.abortScan()
  })

  ipcMain.handle('packages:get', async () => {
    return packageService.getPackages()
  })

  ipcMain.handle('hub:get', async (_, take: number, skip: number) => {
    try {
      return hubService.listPackages(take, skip)
    } catch (err) {
      console.error(err)
      return []
    }
  })
}

app
  .whenReady()
  .then(createWindow)
  .catch((err) => {
    console.error((err as Error)?.message)

    process.exit(0)
  })

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
