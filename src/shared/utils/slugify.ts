import slugify from '@sindresorhus/slugify'

export default (str?: string): string => {
  if (str == null || (str.trim && str.trim() === '')) return ''

  return slugify(str)
}
