import { PropsWithChildren } from 'react'
import Sidebar from '~/components/sidebar/Sidebar.tsx'

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div>
      <Sidebar />
      {children}
    </div>
  )
}
