import { useEffect } from 'react'
import { useLocation } from 'react-router'
import useIPCEvent from '~/hooks/useIPCEvent.ts'
import useStore from '~/hooks/useStore.ts'
import Layout from './Layout.tsx'
import Routes from './Routes.tsx'

export default function App() {
  const location = useLocation()
  const setLastLocation = useStore((state) => state['location.setLast'])

  useIPCEvent('import.progress', (dir, pct) => console.log(dir, pct))

  useEffect(() => {
    if (location.pathname === '/') {
      return
    }

    const nextLocation = `${location.pathname}${location.search}${location.hash}`
    setLastLocation(nextLocation)
  }, [location.hash, location.pathname, location.search, setLastLocation])

  return (
    <Layout>
      <Routes />
    </Layout>
  )
}
