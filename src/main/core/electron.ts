import * as electron from 'electron'

export { type UtilityProcess, type CustomScheme } from 'electron'

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
