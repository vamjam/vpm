import { Allotment } from 'allotment'
import 'allotment/dist/style.css'
import { PropsWithChildren, useCallback, useEffect, useRef } from 'react'
import Sidebar from '~/components/sidebar/Sidebar.tsx'
import useStore from '~/hooks/useStore.ts'

export default function Layout({ children }: PropsWithChildren) {
  const sidebarWidth = useStore((state) => state['sidebar.width'])
  const setSidebarWidth = useStore((state) => state['sidebar.setWidth'])
  const debounceRef = useRef<number | null>(null)

  const handleResize = useCallback(
    ([sidebarSize]: number[]) => {
      if (debounceRef.current !== null) {
        window.clearTimeout(debounceRef.current)
      }

      debounceRef.current = window.setTimeout(() => {
        setSidebarWidth(Math.round(sidebarSize))
      }, 150)
    },
    [setSidebarWidth],
  )

  useEffect(() => {
    return () => {
      if (debounceRef.current !== null) {
        window.clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <Allotment
      separator={false}
      proportionalLayout={false}
      onChange={handleResize}>
      <Allotment.Pane minSize={200} maxSize={400} preferredSize={sidebarWidth}>
        <Sidebar />
      </Allotment.Pane>
      <Allotment.Pane>{children}</Allotment.Pane>
    </Allotment>
  )
}
