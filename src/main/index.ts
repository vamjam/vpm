import Application from '~/core/application.ts'
import { app } from '~/core/electron.ts'
import { os, process } from '~/core/node.ts'
import { registerThumbnailProtocol } from '~/protocol/thumbnail.protocol.ts'

const registerThumbnailProtocolHandler = registerThumbnailProtocol()

app.on('ready', async () => {
  const application = new Application()
  const { log } = application

  registerThumbnailProtocolHandler(application.config)

  try {
    try {
      await application.initialize()
    } catch (error) {
      log.error('Failed to initialize application:', error)
    }

    const shutdown = async () => {
      await application?.shutdown()

      app.quit()
    }

    process.on('uncaughtException', async (error) => {
      log.error('FATAL: Uncaught exception:', error)
      await shutdown()
    })

    process.on('unhandledRejection', (reason) => {
      log.error('Unhandled rejection:', reason)
    })

    process.on('SIGINT', async () => {
      log.error('Received SIGINT, shutting down gracefully...')

      await shutdown()
    })

    process.on('SIGTERM', async () => {
      log.error('Received SIGTERM, shutting down gracefully...')

      await shutdown()
    })

    app.on('window-all-closed', async () => {
      if (os.platform() !== 'darwin') {
        await shutdown()
      }
    })
  } finally {
    // await exiftool.end(true)
  }
})
