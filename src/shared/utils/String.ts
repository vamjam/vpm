export const isNullOrEmpty = (val?: unknown): val is undefined | null | '' => {
  return !(typeof val === 'string' && val.length > 0)
}
