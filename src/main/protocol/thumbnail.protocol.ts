import { type CustomScheme, protocol } from '~/core/electron.ts'
import { IZipEntry, Zip, stringSimilarity } from '~/core/external.ts'
import { fileURLToPath, path } from '~/core/node.ts'

const VPM_SCHEME = 'vpm'
const CACHE_LENGTH = 60 * 60 * 24 * 7 * 52 // 1 year

const schemes: CustomScheme[] = [
  {
    scheme: VPM_SCHEME,
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

  return () => {
    protocol.handle(VPM_SCHEME, async (req) => {
      try {
        const url = new URL(req.url)
        const filePath = fileURLToPath(url.searchParams.get('file')!)

        const thumbnail = await findThumbnail(filePath)

        if (thumbnail) {
          const contentType = detectThumbnailMimeType(thumbnail) ?? 'image/jpeg'

          return new Response(new Uint8Array(thumbnail), {
            status: 200,
            headers: {
              'Content-Type': contentType,
              'Cache-Control': `public, max-age=${CACHE_LENGTH}`,
            },
          })
        }

        return new Response('Not found', {
          status: 404,
          headers: {
            'Content-Type': 'text/plain',
          },
        })
      } catch {
        return new Response('Not found', {
          status: 404,
          headers: {
            'Content-Type': 'text/plain',
          },
        })
      }
    })
  }
}

async function findThumbnail(filePath: string) {
  const zip = new Zip(filePath)
  const packageName = path.basename(filePath, path.extname(filePath))
  const imageMap = imageMapParser(packageName)
  const images = zip
    .getEntries()
    .filter(imageFilter)
    .map(imageMap)
    .sort((a, b) => b.sort - a.sort)

  if (images.length === 0) {
    return undefined
  }

  return extractBuffer(zip, images[0].path)
}

const IMAGE_EXTS = ['.png', '.jpg', '.jpeg']

function imageFilter(entry: IZipEntry) {
  if (entry.isDirectory || entry.entryName.includes('Texture')) {
    return false
  }

  return IMAGE_EXTS.includes(path.extname(entry.entryName))
}

function imageMapParser(packageName: string) {
  return (entry: IZipEntry) => {
    const { entryName } = entry
    const imageName = path.basename(entryName, path.extname(entryName))
    const score = stringSimilarity.compareTwoStrings(packageName, imageName)

    return {
      sort: Math.floor(score * 100),
      path: entryName,
    }
  }
}

async function extractBuffer(zip: Zip, path: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    zip.getEntry(path)?.getDataAsync((data, err) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
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
