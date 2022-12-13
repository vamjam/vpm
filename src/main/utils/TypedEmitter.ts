import EventEmitter from 'node:events'
import TypedEmitterBase, { EventMap as TypedEventMap } from 'typed-emitter'

export type EventMap = TypedEventMap

export default abstract class TypedEmitter<
  T extends EventMap = Record<string, never>
> extends (EventEmitter as {
  new <T extends EventMap>(): TypedEmitterBase<T>
})<T> {}
