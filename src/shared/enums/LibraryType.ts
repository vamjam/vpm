export const LibraryTypes = {
  INSTALLED: 'INSTALLED',
  SAVED: 'SAVED',
  HUB: 'HUB',
} as const

type LibraryType = keyof typeof LibraryTypes

export default LibraryType
