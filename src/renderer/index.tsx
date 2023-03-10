import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '~/app/App'

const root = document.getElementById('root') as HTMLElement

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
)
