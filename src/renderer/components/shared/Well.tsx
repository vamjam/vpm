import clsx from 'clsx'
import { HTMLAttributes, PropsWithChildren } from 'react'
import styles from './Well.module.css'

type WellProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>

export default function Well({ children, ...props }: WellProps) {
  return (
    <div {...props} className={clsx(styles.well, props.className)}>
      {children}
    </div>
  )
}
