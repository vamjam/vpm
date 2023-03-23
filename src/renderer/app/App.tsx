import { BrowserRouter } from 'react-router-dom'
import Router from '~/app/Router'
import StyleProvider from '~/style/StyleProvider'

export default function App() {
  return (
    <BrowserRouter>
      <StyleProvider>
        <Router />
      </StyleProvider>
    </BrowserRouter>
  )
}
