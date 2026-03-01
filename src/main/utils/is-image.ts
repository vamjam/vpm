import { fsp } from '~/core/node.ts'

const IMAGE_SIGNATURES: Record<string, (buffer: Buffer) => boolean> = {
  jpg: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  png: (b) =>
    b.length >= 8 &&
    b[0] === 0x89 &&
    b[1] === 0x50 &&
    b[2] === 0x4e &&
    b[3] === 0x47 &&
    b[4] === 0x0d &&
    b[5] === 0x0a &&
    b[6] === 0x1a &&
    b[7] === 0x0a,
  gif: (b) =>
    (b.length >= 6 && b.toString('ascii', 0, 6) === 'GIF87a') ||
    b.toString('ascii', 0, 6) === 'GIF89a',
  webp: (b) =>
    b.length >= 12 &&
    b.toString('ascii', 0, 4) === 'RIFF' &&
    b.toString('ascii', 8, 12) === 'WEBP',
  bmp: (b) => b.length >= 2 && b[0] === 0x42 && b[1] === 0x4d,
  tiff: (b) =>
    b.length >= 4 &&
    ((b[0] === 0x49 && b[1] === 0x49 && b[2] === 0x2a && b[3] === 0x00) ||
      (b[0] === 0x4d && b[1] === 0x4d && b[2] === 0x00 && b[3] === 0x2a)),
}

export async function isImage(filePath: string): Promise<boolean> {
  const file = await fsp.open(filePath, 'r')

  try {
    const { buffer } = await file.read({
      buffer: Buffer.alloc(16),
      position: 0,
    })

    return Object.values(IMAGE_SIGNATURES).some((check) => check(buffer))
  } finally {
    await file.close()
  }
}
