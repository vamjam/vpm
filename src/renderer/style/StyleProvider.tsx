import { Fragment, ReactNode } from 'react'
import {
  StyleSheetManager,
  ThemeProvider,
  createGlobalStyle,
} from 'styled-components'
import reset from 'styled-reset'
import { useDarkMode } from 'usehooks-ts'
import { darkTheme, lightTheme } from './theme'

const GlobalStyle = createGlobalStyle`
  ${reset}

  body {
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.primary};
    font-family: 'SF', 'Segoe UI', sans-serif;
    font-size: 18px;
    font-weight: 400;
    line-height: 1.4;
    -webkit-font-smoothing: antialiased;
    overflow: hidden;
  }

  ::-webkit-scrollbar {
    width: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.primary600};
    border-radius: 6px;
    border: 3px solid ${({ theme }) => theme.colors.surface};
    transition: background-color 2s ease-out;
  }

  ::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, 0);
  }
`

export default function StyleProvider({
  children,
}: {
  children: ReactNode
}): JSX.Element {
  const { isDarkMode } = useDarkMode()
  const theme = isDarkMode ? darkTheme : lightTheme

  return (
    <ThemeProvider theme={theme}>
      <StyleSheetManager disableVendorPrefixes>
        <Fragment>
          <GlobalStyle />
          {children}
        </Fragment>
      </StyleSheetManager>
    </ThemeProvider>
  )
}
