import { ReactNode } from 'react'
import { StyleSheetManager } from 'styled-components'

type StyleProviderProps = {
  children: ReactNode
}

export default function StyleProvider({
  children,
}: StyleProviderProps): JSX.Element {
  return <StyleSheetManager disableVendorPrefixes>{children}</StyleSheetManager>
}
