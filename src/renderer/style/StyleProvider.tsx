import { Fragment, ReactNode } from 'react'
import { StyleSheetManager } from 'styled-components'

type StyleProviderProps = {
  children: ReactNode
}

export default function StyleProvider({ children }: StyleProviderProps) {
  return (
    <Fragment>
      <StyleSheetManager disableVendorPrefixes>{children}</StyleSheetManager>
    </Fragment>
  )
}
