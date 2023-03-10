import { app } from 'electron'

export const ENV = app.isPackaged ? 'prod' : 'dev'
export const IS_PROD = ENV === 'prod'
export const IS_DEV = IS_PROD === false
