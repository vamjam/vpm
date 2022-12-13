import path from 'node:path'
import process from 'node:process'
import { BrowserWindow, app, dialog, ipcMain } from 'electron'
import logger from '@shared/logger'
import wait from '@shared/utils/wait'
import { configService, libraryService } from '~/services'

const { NODE_ENV } = process.env
const isDev = NODE_ENV !== 'production'

const log = logger('electron.main')

log.info(
  `Starting main process in ${isDev ? 'DEVELOPMENT' : 'PRODUCTION'} mode`
)

if (isDev) {
  log.debug('runtimes', {
    Electron: process.versions.electron,
    Chrome: process.versions.chrome,
    Node: process.versions.node,
  })
}

const bootstrapServices = async (window: BrowserWindow) => {
  log.debug('Bootstrapping services...')

  libraryService.attach(
    window,
    ipcMain,
    'package:install',
    'package:save',
    'scan:error',
    'scan:progress'
  )

  configService.attach(window, ipcMain, 'config:change')

  configService.on('config:change', (key) => {
    if (key === 'library.path') {
      libraryService['packages:scan']()
    }
  })

  await wait(5)

  libraryService['packages:scan']()
}

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
      // Disable this, ONLY in DEV, to allow loading of local
      // images when using the dev server
      webSecurity: isDev ? false : true,
      nodeIntegrationInWorker: true, // multi-threading!
      preload: path.join(__dirname, 'preload.cjs'),
    },
  })

  bootstrapServices(mainWindow)

  mainWindow.once('ready-to-show', () => mainWindow.show())

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')

    wait(1).then(() => mainWindow.webContents.openDevTools())
  } else {
    mainWindow.loadFile(path.join(__dirname, 'index.html'))
  }

  ipcMain.handle('dialog:openDirectory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
    })

    return canceled ? undefined : filePaths[0]
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