import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// import { BrowserRouter } from 'react-router'

// import { App } from '~/components/app/index.ts'

const App = () => <h1>VPM App</h1>

const root = document.getElementById('root') as HTMLElement

createRoot(root).render(
  <StrictMode>
    {/* <BrowserRouter> */}
    <App />
    {/* </BrowserRouter> */}
  </StrictMode>,
)
