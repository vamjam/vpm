import * as electron from 'electron'

export {
  type UtilityProcess,
  type CustomScheme,
  type MessagePortMain,
} from 'electron'

const {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  screen,
  utilityProcess,
  protocol,
  MessageChannelMain,
} = electron

export {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  screen,
  utilityProcess,
  protocol,
  MessageChannelMain,
}
