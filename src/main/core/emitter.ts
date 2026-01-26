import TypedEventEmitter, { EventMap } from 'typed-emitter'

export type TypedEmitter<T extends EventMap> = TypedEventEmitter.default<T>

export type CustomEmitter<T extends EventMap> = new () => TypedEmitter<T>

export { type EventMap }
