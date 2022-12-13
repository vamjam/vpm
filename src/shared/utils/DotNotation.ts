type DotNotation<T, V> = T extends V
  ? ''
  : {
      [K in Extract<keyof T, string>]: Dot<K, DotNotation<T[K], V>>
    }[Extract<keyof T, string>]

type Dot<T extends string, U extends string> = '' extends U ? T : `${T}.${U}`

export default DotNotation
