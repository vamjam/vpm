import clsx from 'clsx'
import { HTMLAttributes, PropsWithChildren } from 'react'
import styles from './ButtonGroup.module.css'

type ButtonGroupProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>> & {
  inverse?: boolean
}

export default function ButtonGroup({
  children,
  inverse,
  ...props
}: ButtonGroupProps) {
  const className = clsx(styles.container, { [styles.inverse]: inverse })

  return (
    <div {...props} className={className}>
      {children}
    </div>
  )
}
