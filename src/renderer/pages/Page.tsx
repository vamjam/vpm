import { PropsWithChildren, ReactNode } from 'react'
import Stack from '~/components/layout/stack/Stack.tsx'
import styles from './Page.module.css'

type PageProps = PropsWithChildren<{
  titlebar?: {
    title?: string
    children?: ReactNode
  }
}>

export default function Page({ titlebar, children }: PageProps) {
  return (
    <Stack className={styles.container}>
      <Titlebar title={titlebar?.title}>{titlebar?.children}</Titlebar>
      <div className={styles.content}>{children}</div>
    </Stack>
  )
}

function Titlebar({
  title,
  children,
  ...props
}: PropsWithChildren<{ title?: string }>) {
  return (
    <div className={styles.titlebar}>
      {title && <h1 {...props}>{title}</h1>}
      {children}
    </div>
  )
}
