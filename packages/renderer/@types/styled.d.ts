import 'styled-components'
import { Colors } from '~/style/theme'

declare module 'styled-components' {
  export interface DefaultTheme {
    name: string
    borderRadius: string
    colors: Colors
  }
}
