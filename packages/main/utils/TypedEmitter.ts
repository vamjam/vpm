import EventEmitter from 'node:events'
import LibTypedEmitter from 'typed-emitter'

export type EventMap = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: (...args: any[]) => void
}

export default class TypedEmitter<T extends EventMap> extends (EventEmitter as {
  new <T extends EventMap>(): LibTypedEmitter<T>
})<T> {}
