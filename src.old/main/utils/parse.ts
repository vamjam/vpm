const charsToReplace = ['\n', '\r', '\n\r', '\0', '\\', '\b', '\f']

export const parseFormatting = (text?: string | null) => {
  if (text == null) {
    return undefined
  }

  return charsToReplace.reduce((acc, seq) => {
    return acc.replaceAll(seq, '')
  }, text)
}

export const parseId = (value?: string | null) => {
  const id = parseNumber(value)

  if (id == null) {
    throw new Error(`Unable to parse id: "${value}"`)
  }

  return id
}

export const parseNumber = (
  value?: string | number | undefined | null
): number | null => {
  if (typeof value === 'number') {
    return value
  }

  if (value == null || value === 'null' || value === 'undefined') {
    return null
  }

  const parsed = Number(value)

  if (Number.isNaN(parsed)) {
    return null
  }

  return parsed
}

export const parseDate = (value?: string | null) => {
  const asNumber = parseNumber(value)

  if (asNumber != null) {
    return new Date(asNumber * 1000)
  }

  return null
}

export const parseBool = (value?: string | null) => {
  if (value == null) {
    return false
  }

  return value === 'true'
}
