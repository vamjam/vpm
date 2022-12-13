import { StrictMode } from 'react'
// import { render } from 'react-dom'
import { createRoot } from 'react-dom/client'
import App from '~/app/App'

/**
 * React 18's render mode breaks x-term, so for now, we have
 * to use the old render, which throws a nice error in the
 * console that we can safely ignore.
 */
const root = document.getElementById('root') as HTMLElement

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
)

// render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
//   root
// )
