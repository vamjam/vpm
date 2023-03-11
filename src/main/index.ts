import path from 'node:path'
import process from 'node:process'
import { BrowserWindow, app, dialog, ipcMain } from 'electron'
import { IS_DEV } from '~/config'
import logger from '~/logger'

const log = logger('electron.main')

log.info(
  `Starting main process in ${IS_DEV ? 'DEVELOPMENT' : 'PRODUCTION'} mode`
)

if (IS_DEV) {
  log.info('Runtime versions:', JSON.stringify(process.versions, null, 2))
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
    },
    webPreferences: {
      /**
       * !! important !!
       * This is ONLY disabled in development mode, to allow
       * the loading of images from the dev server.
       */
      webSecurity: IS_DEV ? false : true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  })

  mainWindow.once('ready-to-show', () => mainWindow.show())

  if (IS_DEV) {
    await mainWindow.loadURL('http://localhost:5173')

    mainWindow.webContents.openDevTools()
  } else {
    await mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'))
  }

  ipcMain.handle('dialog:openDirectory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
    })

    return canceled ? undefined : filePaths[0]
  })

  log.info('Main window created.')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  app.quit()
})
