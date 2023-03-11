import process from 'node:process'
import { app } from 'electron'

export const ENV =
  process.env.NODE_ENV === 'production' || app.isPackaged
    ? 'production'
    : 'development'
export const IS_PROD = ENV === 'production'
export const IS_DEV = IS_PROD === false
