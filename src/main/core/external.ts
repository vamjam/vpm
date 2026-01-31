import TypedEventEmitter, { EventMap } from 'typed-emitter'

export { default as Zip, type IZipEntry } from 'adm-zip'
export { default as stringSimilarity } from 'string-similarity'

export { default as pms } from 'pretty-ms'

export type TypedEmitter<T extends EventMap> = TypedEventEmitter.default<T>

export type CustomEmitter<T extends EventMap> = new () => TypedEmitter<T>

export { type EventMap }
