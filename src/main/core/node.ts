import { exec as cpExec } from 'node:child_process'
import { promisify } from 'node:util'

export { spawn } from 'node:child_process'
export { default as crypto } from 'node:crypto'
export { default as EventEmitter } from 'node:events'
export { default as fs, promises as fsp } from 'node:fs'
export { default as os } from 'node:os'
export { default as path } from 'node:path'
export { default as process } from 'node:process'
export { Readable } from 'node:stream'
export { fileURLToPath, pathToFileURL } from 'node:url'

export const exec = promisify(cpExec)
