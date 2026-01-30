import { HTMLAttributes, PropsWithChildren } from 'react'
import styles from './ButtonGroup.module.css'

type ButtonGroupProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>

export default function ButtonGroup({ children, ...props }: ButtonGroupProps) {
  return (
    <div {...props} className={styles.container}>
      {children}
    </div>
  )
}
