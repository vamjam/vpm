export const ImageTypes = {
  INTERNAL: 'INTERNAL',
  HUB_IMAGE: 'HUB_IMAGE',
  HUB_ICON: 'HUB_ICON',
} as const

type ImageType = typeof ImageTypes[keyof typeof ImageTypes]

export default ImageType
