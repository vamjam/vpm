import EventEmitter from 'node:events'
import TypedEmitterBase, { EventMap as TypedEventMap } from 'typed-emitter'

export type EventMap = TypedEventMap

/**
 * Type your EventEmitter!
 * @example
 * import TypedEmitter from '~/lib/TypedEmitter'
 *
 * type ServiceEvents = {
 *   'some-event': (ev: Event) => void
 *   'maybe-another': (ev: Event) => void
 * }
 *
 * export class Service extends TypedEmitter<ServiceEvents> {
 *   init() {
 *     this.emit('some-event', new Event('some-event'))
 *   }
 * }
 */
export default abstract class TypedEmitter<
  T extends EventMap = Record<string, never>
> extends (EventEmitter as {
  new <T extends EventMap>(): TypedEmitterBase<T>
})<T> {}
