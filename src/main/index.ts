import path from 'node:path'
import process from 'node:process'
import { BrowserWindow, app, dialog, ipcMain } from 'electron'
import { PageParams } from '@shared/api'
import wait from '@shared/utils/wait'
import { IS_DEV } from '~/config'
import Repository from '~/db/Repository'
import logger from '~/logger'
import AssetScanner from './assets/AssetScanner'

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

  log.info('Main window created.')
}

const openDirectoryHandler = async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  })

  return canceled ? undefined : filePaths[0]
}

const createKeyedObject = <T extends { id: string }>(data: T[]) => {
  return data.reduce((acc, item) => {
    acc[item['id']] = item

    return acc
  }, {} as Record<string, T>)
}

const getAssetsHandler = async (params: PageParams) => {
  try {
    const assets = await Repository.getAssets(params)

    return createKeyedObject(assets)
  } catch (err) {
    log.error('Unable to get assets!', err as Error)

    return undefined
  }
}

app.whenReady().then(async () => {
  log.info('App ready.')

  ipcMain.handle('dialog:openDirectory', openDirectoryHandler)
  ipcMain.handle('assets:get', (_, args) =>
    getAssetsHandler(args as PageParams)
  )

  createWindow()

  // Wait 3 seconds for everything to be ready
  await wait(3)

  try {
    await AssetScanner.sync()
  } catch (err) {
    log.error(`Asset scan failed with:`, err as Error)
  }
})

app.on('window-all-closed', () => {
  app.quit()
})
