import { type CustomScheme } from 'electron'
import { AssetService } from '~/asset/asset.service.ts'
// import imageExtensions from '~/asset/exts/image-extensions.json' with { type: 'json' }
import { protocol } from '~/core/electron.ts'
import { ExifTool } from '~/core/external.ts'
import { Readable, fs, fsp, path } from '~/core/node.ts'

const THUMBNAIL_SCHEME = 'thumbnail'

// const __imageMimeTypes: Record<string, string> = {}

// async function getImageMimeTypes() {
//   if (Object.keys(__imageMimeTypes).length) return __imageMimeTypes

//   const db = (await import('mime-db')).default

//   Object.keys(db).forEach((key) => {
//     const { extensions } = db[key]

//     extensions?.forEach((ext) => {
//       __imageMimeTypes[ext] = key
//     })
//   })

//   return __imageMimeTypes
// }

// const imageMimeTypes: Record<string, string> = {
//   apng: 'image/apng',
//   avif: 'image/avif',
//   bmp: 'image/bmp',
//   gif: 'image/gif',
//   heic: 'image/heic',
//   heif: 'image/heif',
//   ico: 'image/x-icon',
//   jpe: 'image/jpeg',
//   jpeg: 'image/jpeg',
//   jpg: 'image/jpeg',
//   png: 'image/png',
//   svg: 'image/svg+xml',
//   svgz: 'image/svg+xml',
//   tif: 'image/tiff',
//   tiff: 'image/tiff',
//   webp: 'image/webp',
// }

const schemes: CustomScheme[] = [
  {
    scheme: THUMBNAIL_SCHEME,
    privileges: {
      standard: true,
      secure: true,
      bypassCSP: true,
      stream: true,
      corsEnabled: true,
      supportFetchAPI: true,
    },
  },
]

export function registerThumbnailProtocol() {
  protocol.registerSchemesAsPrivileged(schemes)

  return (exiftool: ExifTool, assetServiceGetter: () => AssetService) => {
    protocol.handle(THUMBNAIL_SCHEME, async (req) => {
      const url = new URL(req.url)
      const rawPath = url.host ? `/${url.host}${url.pathname}` : url.pathname
      const filePath = path.normalize(decodeURIComponent(rawPath))
      const assetService = assetServiceGetter()
      // const ext = path.extname(filePath).slice(1).toLowerCase()
      // const imageExtensions = await getImageMimeTypes()

      // if (!imageExtensions[ext]) {
      //   return new Response('Unsupported asset type', {
      //     status: 415,
      //     headers: {
      //       'Content-Type': 'text/plain',
      //     },
      //   })
      // }

      try {
        const fileStats = await fsp.stat(filePath)

        if (!fileStats.isFile()) {
          return new Response('Not found', {
            status: 404,
            headers: {
              'Content-Type': 'text/plain',
            },
          })
        }
      } catch {
        return new Response('Not found', {
          status: 404,
          headers: {
            'Content-Type': 'text/plain',
          },
        })
      }

      const thumbnail = await extractThumbnailBuffer(exiftool, filePath)

      if (thumbnail) {
        const contentType = detectThumbnailMimeType(thumbnail) ?? 'image/jpeg'

        return new Response(thumbnail, {
          status: 200,
          headers: {
            'Content-Type': contentType,
          },
        })
      }

      const asset = await assetService.getAssetByPath(filePath)
      const contentType = asset?.mimeType
      const stream = fs.createReadStream(filePath)
      const body = Readable.toWeb(stream)

      return new Response(body, {
        status: 200,
        headers: {
          'Content-Type': contentType,
        },
      })
    })
  }
}

async function extractThumbnailBuffer(
  exiftool: ExifTool,
  filePath: string,
): Promise<Buffer | undefined> {
  const tagNames = ['ThumbnailImage', 'PreviewImage', 'JpgFromRaw']

  for (const tag of tagNames) {
    try {
      return exiftool.extractBinaryTagToBuffer(tag, filePath)
    } catch {
      // Try the next tag when a thumbnail isn't present.
    }
  }

  return undefined
}

function detectThumbnailMimeType(buffer: Buffer): string | undefined {
  if (buffer.length < 12) return undefined

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg'
  }

  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return 'image/png'
  }

  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return 'image/gif'
  }

  if (buffer[0] === 0x42 && buffer[1] === 0x4d) {
    return 'image/bmp'
  }

  if (
    buffer[0] === 0x49 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x2a &&
    buffer[3] === 0x00
  ) {
    return 'image/tiff'
  }

  if (
    buffer[0] === 0x4d &&
    buffer[1] === 0x4d &&
    buffer[2] === 0x00 &&
    buffer[3] === 0x2a
  ) {
    return 'image/tiff'
  }

  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return 'image/webp'
  }

  return undefined
}
