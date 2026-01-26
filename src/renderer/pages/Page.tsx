import { PropsWithChildren } from 'react'
import Stack from '~/components/layout/stack/Stack.tsx'
import Well from '~/components/shared/Well.tsx'
import styles from './Page.module.css'

type PageProps = PropsWithChildren<{
  header?: {
    title?: string
    icon?: React.ReactNode
    description?: string
  }
}>

export default function Page({ header, children }: PageProps) {
  return (
    <Stack className={styles.container} gap="0">
      {header && (
        <Well className={styles.well}>
          {header.icon && <div className={styles.icon}>{header.icon}</div>}
          {header.title && <h2>{header.title}</h2>}
          {header.description && <p>{header.description}</p>}
        </Well>
      )}
      {children}
    </Stack>
  )
}
