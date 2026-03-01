import clsx from 'clsx'
import { HTMLAttributes, PropsWithChildren } from 'react'
import styles from './Label.module.css'

export default function Label({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLLabelElement>>) {
  return (
    <label className={clsx(styles.label, className)} {...props}>
      {children}
    </label>
  )
}
