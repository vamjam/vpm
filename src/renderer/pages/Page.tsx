import { PropsWithChildren, ReactNode } from 'react'
import Stack from '~/components/layout/stack/Stack.tsx'
import styles from './Page.module.css'

type PageProps = PropsWithChildren<{
  titlebar?: ReactNode
}>

export default function Page({ titlebar, children }: PageProps) {
  return (
    <Stack className={styles.container}>
      <div className={styles.titlebar}>{titlebar}</div>
      <div className={styles.content}>{children}</div>
    </Stack>
  )
}
