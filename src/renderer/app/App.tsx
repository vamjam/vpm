import { BrowserRouter } from 'react-router-dom'
import { StoreProvider } from '~/store'
import { StyleProvider } from '~/style'
import Router from './Router'

export default function App(): JSX.Element {
  return (
    <BrowserRouter>
      {/* <StoreProvider> */}
      <StyleProvider>
        <Router />
      </StyleProvider>
      {/* </StoreProvider> */}
    </BrowserRouter>
  )
}
