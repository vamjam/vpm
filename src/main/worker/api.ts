import { type MessageEvent } from 'electron'

// export type WorkerMessage<T extends object = object> = {
//   message: string
//   data?: T
// }

// export function sendMessage<T extends object>(
//   message: string,
//   data: T = {} as T,
// ) {
//   process.parentPort?.postMessage({ message, data } as WorkerMessage<T>)
// }

// export function onMessage<T extends object = object>(
//   event: string,
//   handler: (data: T) => void,
// ) {
//   const wrapper = (msg: MessageEvent) => {
//     const workerMessage = msg.data as WorkerMessage

//     if (workerMessage.message === event) {
//       handler(workerMessage.data as T)
//     }
//   }

//   process.parentPort.on('message', wrapper)

//   return () => {
//     process.parentPort?.off('message', wrapper)
//   }
// }

export function parseArgs(): Record<string, string> {
  const args = process.argv.slice(2)
  const parsedArgs = args.reduce<Record<string, string>>((acc, arg) => {
    const [key, value] = arg.split('=')
    acc[key.replace(/^--/, '')] = value || ''
    return acc
  }, {})

  console.log('Worker initialized with args:', parsedArgs)

  return parsedArgs
}
