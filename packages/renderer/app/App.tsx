import { BrowserRouter } from 'react-router-dom'
import StyleProvider from '~/style/StyleProvider'
import Router from './Router'

export default function App(): JSX.Element {
  return (
    <BrowserRouter>
      <StyleProvider>
        <Router />
      </StyleProvider>
    </BrowserRouter>
  )
}
