import { useEffect } from 'react'
import { useLocation } from 'react-router'
import Sidebar from '~/components/sidebar/Sidebar.tsx'
import useStore from '~/hooks/useStore.ts'
import styles from './App.module.css'
import Routes from './Routes.tsx'

export default function App() {
  const location = useLocation()
  const setLastLocation = useStore((state) => state['location.setLast'])

  useEffect(() => {
    if (location.pathname === '/') {
      return
    }

    const nextLocation = `${location.pathname}${location.search}${location.hash}`
    setLastLocation(nextLocation)
  }, [location.hash, location.pathname, location.search, setLastLocation])

  return (
    <div className={styles.container}>
      <Sidebar className={styles.sidebar} />
      <div className={styles.content}>
        <Routes />
      </div>
    </div>
  )
}
