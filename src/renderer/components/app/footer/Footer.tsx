import clsx from 'clsx'
import { HTMLAttributes, useCallback } from 'react'
import { useXTerm } from 'react-xtermjs'
import useMessage from '~/hooks/useMessage.ts'
import styles from './Footer.module.css'
import '@xterm/xterm/css/xterm.css'

export default function Footer(props: HTMLAttributes<HTMLDivElement>) {
  const { instance, ref } = useXTerm()

  const handleMessage = useCallback(
    (data: string) => {
      instance?.writeln(data)
    },
    [instance],
  )

  useMessage(handleMessage)

  return (
    <footer {...props} className={clsx(styles.container, props.className)}>
      <div ref={ref} style={{ width: '100%', height: '100%' }} />
    </footer>
  )
}
