export const ImageSources = {
  MANIFEST: 'MANIFEST',
  HUB: 'HUB',
} as const

type ImageSource = typeof ImageSources[keyof typeof ImageSources]

export default ImageSource
