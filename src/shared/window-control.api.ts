import { type IpcRenderer } from 'electron'

export type WindowControlAction = 'minimize' | 'maximize.toggle' | 'close'

const WINDOW_CONTROL_CHANNEL = 'window.control' as const

export type WindowControlAPI = {
  [WINDOW_CONTROL_CHANNEL]: (action: WindowControlAction) => Promise<void>
}

export function createWindowControls(
  ipcRenderer: IpcRenderer,
): WindowControlAPI {
  return {
    [WINDOW_CONTROL_CHANNEL]: (action: WindowControlAction): Promise<void> => {
      ipcRenderer.send(WINDOW_CONTROL_CHANNEL, action)

      return Promise.resolve()
    },
  }
}
