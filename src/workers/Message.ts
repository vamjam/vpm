export type MessageEvent = {
  error: { message: string }
  'shallow.start': void
  'shallow.progress': { value: number; assetType: string }
  'shallow.complete': void
  'deep.start': void
  'deep.progress': { value: number }
  'deep.complete': void
}

export type MessageType = keyof MessageEvent

export function sendMessage<T extends MessageType>(
  type: T,
  args?: MessageEvent[T],
) {
  return console.log(
    JSON.stringify({
      ...args,
      type,
    }),
  )
}
