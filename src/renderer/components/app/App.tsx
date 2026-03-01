import { Fragment, useEffect } from 'react'
import { useLocation } from 'react-router'
import Sidebar from '~/components/sidebar/Sidebar.tsx'
import useStore from '~/hooks/useStore.ts'
import Scanning from '../scanning/Scanning.tsx'
import styles from './App.module.css'
import Routes from './Routes.tsx'
import Footer from './footer/Footer.tsx'

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
    <Fragment>
      <Scanning />
      <div className={styles.container}>
        <Sidebar className={styles.sidebar} />
        <div className={styles.content}>
          <Routes />
        </div>
      </div>
      <Footer className={styles.footer} />
    </Fragment>
  )
}
