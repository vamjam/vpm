import { join, normalize } from 'node:path'
import url from 'node:url'
import { isNullOrEmpty } from '@shared/utils/String'

export const pathParser = {
  toEntity(root: URL, fullPath: string) {
    return normalize(fullPath).replace(url.fileURLToPath(root), '')
  },
  fromEntity(root: URL, relativePath: string) {
    return join(url.fileURLToPath(root), normalize(relativePath))
  },
}

export const arrayParser = {
  fromEntity(arr: string | null): string[] {
    return arr && arr.indexOf(',') > -1 ? arr.split(',') : []
  },
}

export const numberParser = {
  fromEntity(num: string | null) {
    return isNullOrEmpty(num) ? null : Number(num)
  },
}

export const dateParser = {
  toEntity(date: Date | null) {
    if (date == null) {
      return null
    }

    return date.getTime()
  },
  fromEntity(date: number | null) {
    if (date == null) {
      return null
    }

    return new Date(date)
  },
}

export const boolParser = {
  toEntity(bool: boolean | null) {
    return bool == null ? null : bool ? 1 : 0
  },
  fromEntity(entity: number | null) {
    return entity == null ? null : entity === 1
  },
}

export const stringParser = {
  toEntity(value?: string | null) {
    return isNullOrEmpty(value) ? null : value
  },
}

export default {
  path: pathParser,
  array: arrayParser,
  number: numberParser,
  date: dateParser,
  bool: boolParser,
  string: stringParser,
}
