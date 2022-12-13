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

export default {
  number: parseNumber,
  date: parseDate,
  bool: parseBool,
}
