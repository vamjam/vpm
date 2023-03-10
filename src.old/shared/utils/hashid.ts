import Hashids from 'hashids'
import { isNullOrEmpty } from './String'

const hashids = new Hashids('virtamate')

export const encode = (id: number) => hashids.encode(id)
export const decode = (hash?: string) => {
  if (isNullOrEmpty(hash)) {
    throw new Error('Invalid hash')
  }

  return hashids.decode(hash)?.[0] as number
}

export default {
  encode,
  decode,
}
