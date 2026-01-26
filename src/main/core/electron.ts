import * as electron from 'electron'

export { type UtilityProcess } from 'electron'

const {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  screen,
  utilityProcess,
  protocol,
} = electron

export { app, BrowserWindow, dialog, ipcMain, screen, utilityProcess, protocol }
